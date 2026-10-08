import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  entry: ["src/index.ts", "src/vite.ts", "src/hooks.ts", "src/islands.ts", "src/renderer.ts"],
  format: "esm",
  dts: true,
  unbundle: true,
  external: [
    "solid-js",
    "@solidjs/web",
    "@solidjs/h",
    "@solidjs/vite-plugin",
    "@pracht/core",
    "vite",
  ],
});
