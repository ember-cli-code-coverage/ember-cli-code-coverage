'use strict';

import { createReport } from '../packages/ember-cli-code-coverage/lib/reports';
import { expect, describe, it } from 'vitest';

describe('reports', () => {
  it('createReport with simple reporter', async () => {
    const report = createReport('lcov');

    expect(Object.keys(report)).toContain('lcov');
  });

  it('createReport with options', async () => {
    const report = createReport([
      'lcov',
      {
        projectRoot: 'some/where/else',
      },
    ]);

    expect(Object.keys(report)).toContain('lcov');
    expect(report.lcov.projectRoot).toBe('some/where/else');
  });
});
