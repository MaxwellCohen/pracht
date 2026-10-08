import { createRequire } from "node:module";
import preactPreset from "@preact/preset-vite";
import type { PluginOption } from "vite";

import type { PrachtRendererVite } from "@pracht/core";

const require = createRequire(import.meta.url);

export interface PreactRendererViteOptions {
  /**
   * Opt into precompiling safe Preact JSX DOM subtrees for SSR/SSG server
   * bundles. Client bundles keep the normal Preact JSX transform.
   *
   * When enabled, `@pracht/preact-ssr-precompile` is required lazily so apps
   * that never opt in do not need that package on the critical path.
   */
  precompileSsrJsx?: boolean | Record<string, unknown>;
}

/**
 * Vite-facing Preact renderer descriptor for `pracht({ renderer: preact() })`.
 */
export function preact(options: PreactRendererViteOptions = {}): PrachtRendererVite {
  return {
    id: "preact",
    plugins(): PluginOption[] {
      const plugins: PluginOption[] = [];
      if (options.precompileSsrJsx) {
        const { preactSsrPrecompile } = require("@pracht/preact-ssr-precompile") as {
          preactSsrPrecompile: (opts: Record<string, unknown>) => PluginOption;
        };
        plugins.push(
          preactSsrPrecompile({
            ...(options.precompileSsrJsx === true ? {} : options.precompileSsrJsx),
            ssrOnly: true,
          }),
        );
      }
      plugins.push(...(preactPreset() as PluginOption[]));
      return plugins;
    },
    dedupe: ["preact", "preact-render-to-string"],
    vendorChunkTest: /node_modules[\\/]preact/,
    jsxImportSource: "preact",
  };
}

export default preact;
