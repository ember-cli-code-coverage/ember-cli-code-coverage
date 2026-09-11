import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 1000 * 60 * 10,
    include: ['test-packages/*-test.mjs'],

    // Each of these tests runs a real Ember build and a browser test run.
    // In parallel they contend for CPU hard enough that some modules never
    // finish loading, so a run can collect less coverage than the same test
    // collects on its own — which makes the snapshots flap. Serial is slower
    // but is the only way these assertions mean anything.
    fileParallelism: false,
  },
});
