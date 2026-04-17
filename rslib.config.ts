import { defineConfig } from "@rslib/core";

export default defineConfig({
  lib: [
    {
      format: "esm",
      bundle: true,
      dts: {
        bundle: true,
        tsgo: true, // 10x faster DTS generation
      },
      output: {
        distPath: "./dist",
      },
      source: {
        entry: {
          index: "./src/index.ts",
        },
      },
    },
    {
      format: "esm",
      dts: {
        bundle: false,
        tsgo: true, // 10x faster DTS generation
      },
      output: {
        distPath: "./dist/cli",
      },
      source: {
        entry: {
          index: "./src/cli/index.ts",
        },
      },
    },
  ],
  output: {
    target: "node",
    cleanDistPath: true,
    externals: {
      bun: "module bun",
      "bun:sqlite": "module bun:sqlite",
      "@ast-grep/napi": "node-commonjs @ast-grep/napi",
      zod: "module zod",
    },
  },
});
