/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { inspect } from 'util';
import { errors } from '@elastic/elasticsearch';
import { errors as serverlessErrors } from '@elastic/elasticsearch-serverless';

export const patchElasticsearchClient = () => {
  const baseErrorPrototype = errors.ElasticsearchClientError.prototype;
  const baseServerlessErrorPrototype = serverlessErrors.ElasticsearchClientError.prototype;
  // @ts-expect-error
  baseErrorPrototype.toJSON = baseServerlessErrorPrototype.toJSON = function () {
    return {
      name: this.name,
      message: this.message,
    };
  };

  // @ts-expect-error
  baseErrorPrototype[inspect.custom] = baseServerlessErrorPrototype[inspect.custom] = function () {
    // @ts-expect-error
    return this.toJSON();
  };
};
