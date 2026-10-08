/**
 * @pracht/solid — SolidJS 2.0 UI renderer for Pracht (fels).
 *
 * Importing this package registers the Solid renderer. Prefer
 * `pracht({ renderer: solid() })` from `@pracht/solid/vite` in Vite configs.
 */
import { ensureSolidRenderer, solidRenderer } from "./renderer.ts";
import { setRenderer, type PrachtRenderer } from "@pracht/core";

declare module "@pracht/core" {
  interface PrachtRendererTypes {
    Component: import("solid-js").Component<any>;
    Children: import("solid-js").JSX.Element;
    ComponentType: import("solid-js").Component<any>;
  }
}

ensureSolidRenderer();

export { ensureSolidRenderer, solidRenderer, setRenderer };
export { Loading, Errored } from "./renderer.ts";
export type { PrachtRenderer };

export function createSolidRenderer(): PrachtRenderer {
  return ensureSolidRenderer();
}
