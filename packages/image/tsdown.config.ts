import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  entry: ["src/index.ts", "src/node.ts", "src/vite.ts", "src/solid.ts"],
  format: "esm",
  dts: true,
  external: ["preact", "@solidjs/h", "sharp", "vite", /^node:/],
});

