/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: Get Action status schema
 *   version: 2023-10-31
 */

import { z } from '@kbn/zod';

import { AgentIds, AgentId } from '../../model/schema/common.gen';

export type PendingActionDataType = z.infer<typeof PendingActionDataType>;
export const PendingActionDataType = z.number().int();

export type PendingActionsSchema = z.infer<typeof PendingActionsSchema>;
export const PendingActionsSchema = z.union([
  z.object({
    isolate: PendingActionDataType.optional(),
    unisolate: PendingActionDataType.optional(),
    'kill-process': PendingActionDataType.optional(),
    'suspend-process': PendingActionDataType.optional(),
    'running-processes': PendingActionDataType.optional(),
    'get-file': PendingActionDataType.optional(),
    execute: PendingActionDataType.optional(),
    upload: PendingActionDataType.optional(),
    scan: PendingActionDataType.optional(),
  }),
  z.object({}).catchall(z.unknown()),
]);

export type ActionStatusSuccessResponse = z.infer<typeof ActionStatusSuccessResponse>;
export const ActionStatusSuccessResponse = z.object({
  body: z.object({
    data: z.object({
      agent_id: AgentId,
      pending_actions: PendingActionsSchema,
    }),
  }),
});

export type EndpointGetActionsStatusRequestQuery = z.infer<
  typeof EndpointGetActionsStatusRequestQuery
>;
export const EndpointGetActionsStatusRequestQuery = z.object({
  query: z.object({
    agent_ids: AgentIds.optional(),
  }),
});
export type EndpointGetActionsStatusRequestQueryInput = z.input<
  typeof EndpointGetActionsStatusRequestQuery
>;

export type EndpointGetActionsStatusResponse = z.infer<typeof EndpointGetActionsStatusResponse>;
export const EndpointGetActionsStatusResponse = ActionStatusSuccessResponse;
