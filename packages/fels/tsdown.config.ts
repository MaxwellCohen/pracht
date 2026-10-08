import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  entry: ["src/index.ts", "src/vite.ts"],
  format: "esm",
  dts: true,
  unbundle: true,
  external: [
    "@pracht/core",
    "@pracht/solid",
    "@pracht/vite-plugin",
    "solid-js",
    "@solidjs/web",
    "vite",
  ],
});
