/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createFailError } from '@kbn/dev-cli-errors';
import { matchEntriesWithExtractors } from '../extract_default_translations';
import { I18nConfig } from '../config';
import { normalizePath, readFileAsync, ErrorReporter } from '../utils';
import { I18nCheckTaskContext } from '../types';

function filterEntries(entries: string[], exclude: string[]) {
  return entries.filter((entry: string) =>
    exclude.every((excludedPath: string) => !normalizePath(entry).startsWith(excludedPath))
  );
}

export async function extractUntrackedMessagesTask({
  path,
  config,
  reporter,
}: {
  path?: string | string[];
  config: I18nConfig;
  reporter: ErrorReporter;
}) {
  const inputPaths = Array.isArray(path) ? path : [path || './'];
  const availablePaths = Object.values(config.paths).flat();
  const ignore = availablePaths.concat([
    '**/build/**',
    '**/__fixtures__/**',
    '**/packages/kbn-i18n/**',
    '**/packages/kbn-i18n-react/**',
    '**/packages/kbn-plugin-generator/template/**',
    '**/test/**',
    '**/scripts/**',
    '**/src/dev/**',
    '**/target/**',
    '**/dist/**',
  ]);
  for (const inputPath of inputPaths) {
    const { entries, extractFunction } = await matchEntriesWithExtractors(inputPath, {
      additionalIgnore: ignore,
      mark: true,
      absolute: true,
    });

    const files = await Promise.all(
      filterEntries(entries, config.exclude)
        .filter((entry) => {
          const normalizedEntry = normalizePath(entry);
          return !availablePaths.some(
            (availablePath) =>
              normalizedEntry.startsWith(`${normalizePath(availablePath)}/`) ||
              normalizePath(availablePath) === normalizedEntry
          );
        })
        .map(async (entry: any) => ({
          name: entry,
          content: await readFileAsync(entry),
        }))
    );

    for (const { name, content } of files) {
      const reporterWithContext = reporter.withContext({ name });
      for (const [id] of extractFunction(content, reporterWithContext)) {
        const errorMessage = `Untracked file contains i18n label (${id}).`;
        reporterWithContext.report(createFailError(errorMessage));
      }
    }
  }
}

export function extractUntrackedMessages(inputPaths: string[]) {
  return inputPaths.map((inputPath) => ({
    title: `Checking untracked messages in ${inputPath}`,
    task: async (context: I18nCheckTaskContext) => {
      const { reporter, config } = context;
      const initialErrorsNumber = reporter.errors.length;
      const result = await extractUntrackedMessagesTask({
        path: inputPath,
        config: config as I18nConfig,
        reporter,
      });
      if (reporter.errors.length === initialErrorsNumber) {
        return result;
      }

      throw reporter;
    },
  }));
}
