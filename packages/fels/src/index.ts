/**
 * Fels — Pracht + SolidJS 2.0.
 *
 * Re-exports the UI-agnostic Pracht core APIs and registers the Solid
 * renderer. Prefer `import { fels } from "fels/vite"` in Vite configs.
 */
import "@pracht/solid";

export {
  defineApp,
  group,
  route,
  timeRevalidate,
  webhookRevalidate,
  defineApi,
  json,
  apiFetch,
  createHref,
  defineFont,
  createStore,
  createRouteStore,
  createNavigationStore,
  createHydrationStore,
  definePrachtRenderer,
  getRenderer,
  setRenderer,
} from "@pracht/core";

export type {
  LoaderArgs,
  RouteComponentProps,
  ShellProps,
  RootProps,
  RootModule,
  PrachtRenderer,
  PrachtRendererVite,
  Store,
  RouteStoreSnapshot,
  NavigationStoreSnapshot,
  HydrationStoreSnapshot,
} from "@pracht/core";

export {
  ensureSolidRenderer,
  solidRenderer,
  Loading,
  Errored,
  createSolidRenderer,
} from "@pracht/solid";

export {
  useStore,
  useStoreField,
} from "@pracht/solid/hooks";
