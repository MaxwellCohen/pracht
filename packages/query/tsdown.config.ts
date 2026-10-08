import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  entry: ["src/index.ts", "src/root.ts", "src/preact.ts", "src/solid.ts"],
  format: "esm",
  dts: true,
  external: [
    "@pracht/capabilities",
    "@pracht/core",
    "@tanstack/preact-query",
    "@tanstack/solid-query",
    "@solidjs/h",
    "preact",
    "preact/hooks",
    "solid-js",
  ],
});
