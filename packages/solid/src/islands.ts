/**
 * Compile-time island detection for Solid.
 *
 * Solid has no vnode hooks, so island modules are tagged at transform time
 * with `export const __prachtIsIsland = true`. The SSR path and islands
 * bootstrap use that marker (plus the shared `<preact-island>` HTML contract)
 * to know which components to hydrate. Apps can also call
 * `registerSolidIsland(import.meta.url, Component)` explicitly.
 */
import type { Plugin } from "vite";

export interface IslandTransformOptions {
  islandsDir: string;
}

const ISLAND_MARKER = "/* @pracht-solid-island */";

/**
 * Vite plugin that tags default exports from the islands directory.
 */
export function createIslandTransformPlugin(options: IslandTransformOptions): Plugin {
  const dir = options.islandsDir.replace(/\\/g, "/");

  return {
    name: "pracht:solid-islands",
    enforce: "pre",
    transform(code, id) {
      const normalized = id.replace(/\\/g, "/");
      if (!normalized.includes(dir)) return null;
      if (!/\.[jt]sx?$/.test(normalized)) return null;
      if (code.includes(ISLAND_MARKER)) return null;
      if (!/\bexport\s+default\b/.test(code)) return null;

      return {
        code: code + `\n${ISLAND_MARKER}\nexport const __prachtIsIsland = true;\n`,
        map: null,
      };
    },
  };
}

const islandRegistry = new Map<string, unknown>();

/** Register an island component by module URL for the client bootstrap. */
export function registerSolidIsland(moduleUrl: string, Component: unknown): void {
  islandRegistry.set(moduleUrl, Component);
}

export function getSolidIsland(moduleUrl: string): unknown {
  return islandRegistry.get(moduleUrl);
}

export function listSolidIslands(): ReadonlyMap<string, unknown> {
  return islandRegistry;
}

/** @internal */
export function _resetSolidIslandsForTesting(): void {
  islandRegistry.clear();
}
