---
title: UI Renderers
lead: Pracht's routing, loaders, and adapters are UI-library agnostic. Pick Preact (default) or Solid 2.0 through a renderer package — or start a Solid app with fels.
breadcrumb: UI Renderers
prev:
  href: /docs/rendering
  title: Rendering Modes
next:
  href: /docs/islands
  title: Islands
---

## Overview

A **renderer** owns JSX, hydration, and component hooks. Everything else — the route manifest, loaders, API routes, adapters, capabilities — stays the same.

| Package | UI library | How to select |
| ------- | ---------- | ------------- |
| (default) / `@pracht/preact` | Preact | Omit `renderer`, or `pracht({ renderer: preact() })` |
| `@pracht/solid` / `fels` | SolidJS 2.0 | `pracht({ renderer: solid() })` or `fels()` |

## Preact (default)

Existing apps keep working with no config change. To be explicit:

```ts
import { pracht } from "@pracht/vite-plugin";
import { preact } from "@pracht/preact/vite";

export default {
  plugins: [pracht({ renderer: preact() })],
};
```

## Solid 2.0 / Fels

Fels is Pracht with the Solid renderer pre-selected.

```bash
pnpm create fels my-app
cd my-app && pnpm install && pnpm dev
```

```ts
import { fels } from "fels/vite";

export default {
  plugins: [fels()],
};
```

Solid apps use `solid-js` signals and `@solidjs/web` JSX (`jsxImportSource: "@solidjs/web"`). Loading and Errored replace Suspense and ErrorBoundary.

## Ecosystem packages

- `@pracht/query/preact` and `@pracht/query/solid` — TanStack Query roots per renderer
- `@pracht/image` — framework-free `getImageProps()`; `@pracht/image/solid` for a Solid `<Image>`
- `@pracht/markdown` — pass `jsxFactory` for Solid's `@solidjs/h` when emitting route modules
- `@pracht/i18n` — already UI-library free

## What you will observe

After switching renderers, `pracht dev` still serves the same routes and adapters. Component files use that library's JSX and hooks. Client vendor chunks group the active UI runtime (`preact` or `solid-js`) instead of mixing both.
