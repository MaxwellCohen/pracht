import solidPlugin from "@solidjs/vite-plugin";
import type { PluginOption } from "vite";

import type { PrachtRendererVite } from "@pracht/core";
import { createIslandTransformPlugin } from "./islands.ts";

export interface SolidRendererViteOptions {
  /** Enable compile-time wrapping of `src/islands/` imports. Defaults to true. */
  islands?: boolean;
  /** Directory containing island components. Defaults to "/src/islands". */
  islandsDir?: string;
}

/**
 * Vite-facing Solid renderer descriptor for `pracht({ renderer: solid() })`.
 *
 * Pins Solid 2.0 (`solid-js@2.0.0-rc.14` / `@solidjs/web@2.0.0-rc.14`).
 */
export function solid(options: SolidRendererViteOptions = {}): PrachtRendererVite {
  const islandsEnabled = options.islands !== false;
  const islandsDir = options.islandsDir ?? "/src/islands";

  return {
    id: "solid",
    plugins(): PluginOption[] {
      // Solid 2 vite plugin: SSR uses the server build, client uses DOM.
      const solidPlugins = solidPlugin({
        solid: {
          // Generate separate SSR/DOM transforms per Vite environment.
        },
      }) as PluginOption | PluginOption[];
      const plugins: PluginOption[] = Array.isArray(solidPlugins)
        ? [...solidPlugins]
        : [solidPlugins];
      if (islandsEnabled) {
        plugins.push(createIslandTransformPlugin({ islandsDir }));
      }
      return plugins;
    },
    dedupe: ["solid-js", "@solidjs/web", "@solidjs/signals", "@solidjs/h"],
    vendorChunkTest: /node_modules[\\/](solid-js|@solidjs[\\/])/,
    jsxImportSource: "@solidjs/web",
  };
}

export default solid;
