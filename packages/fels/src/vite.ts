import { pracht, type PrachtPluginOptions } from "@pracht/vite-plugin";
import { solid, type SolidRendererViteOptions } from "@pracht/solid/vite";
import type { Plugin } from "vite";

export interface FelsPluginOptions extends Omit<PrachtPluginOptions, "renderer"> {
  /** Options forwarded to `@pracht/solid/vite`'s `solid()`. */
  solid?: SolidRendererViteOptions;
}

/**
 * Vite plugin for Fels apps — Pracht with the Solid 2.0 renderer pre-selected.
 *
 * ```ts
 * import { defineConfig } from "vite";
 * import { fels } from "fels/vite";
 * export default defineConfig({ plugins: [fels()] });
 * ```
 */
export function fels(options: FelsPluginOptions = {}): Plugin[] {
  const { solid: solidOptions, ...prachtOptions } = options;
  return pracht({
    ...prachtOptions,
    renderer: solid(solidOptions),
  });
}

export default fels;
