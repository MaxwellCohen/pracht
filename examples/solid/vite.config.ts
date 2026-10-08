import { defineConfig } from "vite";
import { fels } from "fels/vite";
import { nodeAdapter } from "@pracht/adapter-node";

export default defineConfig({
  plugins: [
    fels({
      adapter: nodeAdapter({ canonicalOrigin: process.env.PRACHT_ORIGIN }),
    }),
  ],
});
