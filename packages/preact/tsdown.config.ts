import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  entry: ["src/index.ts", "src/vite.ts", "src/hooks.ts"],
  format: "esm",
  dts: true,
  unbundle: true,
  external: [
    "preact",
    "preact/hooks",
    "preact/compat",
    "preact-render-to-string",
    "@pracht/core",
    "@pracht/preact-ssr-precompile",
    "@preact/preset-vite",
    "vite",
  ],
});
