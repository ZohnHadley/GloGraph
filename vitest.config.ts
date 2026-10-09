import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pure-logic tests run in Node; hook tests opt into jsdom per-file via
    // `// @vitest-environment jsdom`.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
