/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { MessageRole } from '@kbn/observability-ai-assistant-plugin/common';
import expect from '@kbn/expect';
import {
  LlmProxy,
  createLlmProxy,
} from '@kbn/test-suites-xpack/observability_ai_assistant_api_integration/common/create_llm_proxy';
import {
  clearKnowledgeBase,
  createKnowledgeBaseModel,
  deleteInferenceEndpoint,
  deleteKnowledgeBaseModel,
  TINY_ELSER,
} from '@kbn/test-suites-xpack/observability_ai_assistant_api_integration/tests/knowledge_base/helpers';
import { FtrProviderContext } from '../../../common/ftr_provider_context';
import { invokeChatCompleteWithFunctionRequest } from './helpers';
import {
  createProxyActionConnector,
  deleteActionConnector,
} from '../../../common/action_connectors';
import type { InternalRequestHeader, RoleCredentials } from '../../../../../../../shared/services';

export default function ApiTest({ getService }: FtrProviderContext) {
  const supertest = getService('supertest');
  const log = getService('log');
  const ml = getService('ml');
  const es = getService('es');
  const observabilityAIAssistantAPIClient = getService('observabilityAIAssistantAPIClient');
  const svlUserManager = getService('svlUserManager');
  const svlCommonApi = getService('svlCommonApi');

  describe('when calling summarize function', function () {
    // TODO: https://github.com/elastic/kibana/issues/192751
    this.tags(['skipMKI']);
    let roleAuthc: RoleCredentials;
    let internalReqHeader: InternalRequestHeader;
    let proxy: LlmProxy;
    let connectorId: string;

    before(async () => {
      roleAuthc = await svlUserManager.createM2mApiKeyWithRoleScope('editor');
      internalReqHeader = svlCommonApi.getInternalRequestHeader();

      await createKnowledgeBaseModel(ml);
      await observabilityAIAssistantAPIClient
        .slsAdmin({
          endpoint: 'POST /internal/observability_ai_assistant/kb/setup',
          params: {
            query: {
              model_id: TINY_ELSER.id,
            },
          },
        })
        .expect(200);

      proxy = await createLlmProxy(log);
      connectorId = await createProxyActionConnector({
        supertest,
        log,
        port: proxy.getPort(),
        roleAuthc,
        internalReqHeader,
      });

      // intercept the LLM request and return a fixed response
      void proxy
        .intercept('conversation', () => true, 'Hello from LLM Proxy')
        .completeAfterIntercept();

      await invokeChatCompleteWithFunctionRequest({
        connectorId,
        observabilityAIAssistantAPIClient,
        functionCall: {
          name: 'summarize',
          trigger: MessageRole.User,
          arguments: JSON.stringify({
            title: 'My Title',
            text: 'Hello world',
            is_correction: false,
            confidence: 'high',
            public: false,
          }),
        },
      });

      await proxy.waitForAllInterceptorsSettled();
    });

    after(async () => {
      proxy.close();
      await deleteActionConnector({ supertest, connectorId, log, roleAuthc, internalReqHeader });
      await deleteKnowledgeBaseModel(ml);
      await clearKnowledgeBase(es);
      await deleteInferenceEndpoint({ es });
    });

    it('persists entry in knowledge base', async () => {
      const res = await observabilityAIAssistantAPIClient.slsEditor({
        endpoint: 'GET /internal/observability_ai_assistant/kb/entries',
        params: {
          query: {
            query: '',
            sortBy: 'title',
            sortDirection: 'asc',
          },
        },
      });

      const { role, public: isPublic, text, type, user, title } = res.body.entries[0];

      expect(role).to.eql('assistant_summarization');
      expect(isPublic).to.eql(false);
      expect(text).to.eql('Hello world');
      expect(type).to.eql('contextual');
      expect(user?.name).to.eql('elastic_editor'); // "editor" in stateful
      expect(title).to.eql('My Title');
      expect(res.body.entries).to.have.length(1);
    });
  });
}
