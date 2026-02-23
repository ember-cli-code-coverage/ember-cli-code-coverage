'use strict';

import { createReport } from '../packages/ember-cli-code-coverage/dist/core/reports.js';
import { expect, describe, it } from 'vitest';

describe('reports', () => {
  it('createReport with simple reporter', async () => {
    const report = createReport('lcov');

    expect(report).toBeDefined();
    expect(typeof report.execute).toBe('function');
  });

  it('createReport with options', async () => {
    const report = createReport([
      'lcov',
      {
        projectRoot: 'some/where/else',
      },
    ]);

    expect(report).toBeDefined();
    expect(typeof report.execute).toBe('function');
  });
});
