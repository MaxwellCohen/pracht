/**
 * @pracht/preact — Preact UI renderer for Pracht.
 *
 * Importing this package registers the Preact renderer as the active default.
 * Prefer `pracht({ renderer: preact() })` from `@pracht/preact/vite` in Vite
 * configs so plugins, dedupe, and HMR are wired correctly.
 */
import {
  ensurePreactRenderer,
  preactRenderer,
  setRenderer,
  type PrachtRenderer,
} from "@pracht/core";

declare module "@pracht/core" {
  interface PrachtRendererTypes {
    // Preact defaults are already the fallback in core; this documents the
    // active renderer for tooling and locks the module graph.
  }
}

ensurePreactRenderer();

export { ensurePreactRenderer, preactRenderer, setRenderer };
export type { PrachtRenderer };

/** Identity helper matching `definePrachtRenderer` for symmetry with Solid. */
export function createPreactRenderer(): PrachtRenderer {
  return ensurePreactRenderer();
}
