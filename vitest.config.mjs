/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    testTimeout: 1000 * 60 * 10,
    include: ['test-packages/*-test.mjs'],
  },
})