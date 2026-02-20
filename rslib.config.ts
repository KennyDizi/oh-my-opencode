import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    // Main plugin entry
    {
      format: 'esm',
      bundle: true,
      dts: {
        bundle: true,
      },
      output: {
        distPath: './dist',
      },
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
    },
    // CLI entry
    {
      format: 'esm',
      dts: {
        bundle: false,
      },
      output: {
        distPath: './dist/cli',
      },
      source: {
        entry: {
          index: './src/cli/index.ts',
        },
      },
    },
  ],
  output: {
    target: 'node', // Bun supports Node.js APIs
    cleanDistPath: true, // Clean dist directory before build
    externals: {
      bun: 'module bun', // ESM runtime — use import
      'bun:sqlite': 'module bun:sqlite', // Bun built-in SQLite module
      '@ast-grep/napi': 'node-commonjs @ast-grep/napi', // Native CJS module — use createRequire
    },
  },
});
