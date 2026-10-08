# Pluggable UI Renderers

Pracht's request pipeline, adapters, loaders, capabilities, and route manifest
are UI-library agnostic. Rendering, hydration, and component hooks live behind
a **renderer** contract.

## Choosing a renderer

```ts
// Preact (default — omit renderer for the same behaviour)
import { pracht } from "@pracht/vite-plugin";
import { preact } from "@pracht/preact/vite";
export default { plugins: [pracht({ renderer: preact() })] };
```

```ts
// SolidJS 2.0 via @pracht/solid, or the fels shorthand
import { pracht } from "@pracht/vite-plugin";
import { solid } from "@pracht/solid/vite";
export default { plugins: [pracht({ renderer: solid() })] };

// Equivalent:
import { fels } from "fels/vite";
export default { plugins: [fels()] };
```

## Packages

| Package | Role |
|---------|------|
| `@pracht/core` | UI-agnostic runtime, stores, renderer contract |
| `@pracht/preact` | Preact renderer + Vite plugins |
| `@pracht/solid` | Solid 2.0 renderer + Vite plugins + islands transform |
| `fels` | Thin Solid-first entry over core + `@pracht/solid` |
| `create-fels` | Scaffold a Fels app |

## Contract

A renderer implements `PrachtRenderer` from `@pracht/core`:

- `h` / `hydrate` / `render` / `createContext`
- `server.composePage`, `server.renderToString`, `server.renderToStream`
- `client.hydrateApp`, `client.renderApp`, `client.hydrateIsland`
- `vite.plugins()`, `vite.dedupe`, `vite.vendorChunkTest`

Core reaches the active renderer through `getRenderer()` and
`virtual:pracht/renderer`.

## Framework-free stores

Route data, navigation, and hydration state live in `createStore()`-backed
objects (`get` / `set` / `subscribe`). Preact hooks re-export from
`@pracht/preact/hooks`; Solid accessors live in `@pracht/solid/hooks`.

## Solid 2.0 pin

`@pracht/solid` and `fels` pin `solid-js@2.0.0-rc.14` and
`@solidjs/web@2.0.0-rc.14`. Loading / Errored replace Suspense / ErrorBoundary.
Update the pin deliberately when bumping Solid RCs.

## Islands

Preact keeps vnode-hook island detection. Solid uses a compile-time transform
that tags modules under `src/islands/` with `__prachtIsIsland`. Both emit the
shared `<preact-island>` HTML markers so the bootstrap script stays common
during the migration.
