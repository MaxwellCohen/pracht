/**
 * Built-in Preact renderer. Self-registers as the default when imported.
 * Extracted later into `@pracht/preact`.
 */
import {
  Component,
  createContext as preactCreateContext,
  Fragment,
  h as preactH,
  hydrate as preactHydrate,
  options as preactOptions,
  render as preactRender,
} from "preact";
import type { ComponentChildren, FunctionComponent, VNode } from "preact";
import { lazy as baseLazy, Suspense as BaseSuspense } from "preact/compat";

import {
  definePrachtRenderer,
  setRenderer,
  type ComposePageOptions,
  type PrachtRenderer,
  type RendererComponent,
  type RendererTree,
  type RenderToReadableStreamHandle,
} from "./renderer.ts";

let _renderToStringAsync: typeof import("preact-render-to-string").renderToStringAsync | undefined;
let _renderToReadableStream:
  | typeof import("preact-render-to-string/stream").renderToReadableStream
  | undefined;

function enableErrorBoundaries(): void {
  (
    preactOptions as typeof preactOptions & {
      errorBoundaries?: boolean;
    }
  ).errorBoundaries = true;
}

async function getRenderToStringAsync() {
  enableErrorBoundaries();
  if (_renderToStringAsync) return _renderToStringAsync;
  const mod = await import("preact-render-to-string");
  _renderToStringAsync = mod.renderToStringAsync;
  return _renderToStringAsync;
}

async function getRenderToReadableStream() {
  enableErrorBoundaries();
  if (_renderToReadableStream) return _renderToReadableStream;
  const mod = await import("preact-render-to-string/stream");
  _renderToReadableStream = mod.renderToReadableStream;
  return _renderToReadableStream;
}

function composePage(options: ComposePageOptions): RendererTree {
  const {
    Root,
    Shell,
    Loading,
    Component: Comp,
    componentProps,
    rootState,
    providers,
  } = options;

  let inner: RendererTree;
  if (Comp) {
    inner = preactH(Comp as FunctionComponent, componentProps ?? null);
  } else if (Loading) {
    inner = preactH(Loading as FunctionComponent, null);
  } else {
    inner = null;
  }

  if (Shell) {
    inner = preactH(Shell as FunctionComponent, null, inner as ComponentChildren);
  }

  if (Root) {
    inner = preactH(
      Root as FunctionComponent<{ state: unknown }>,
      { state: rootState },
      inner as ComponentChildren,
    );
  }

  if (providers) {
    for (let i = providers.length - 1; i >= 0; i--) {
      const { Context, value } = providers[i]!;
      const Provider = Context.Provider as FunctionComponent<{ value: unknown }>;
      inner = preactH(Provider, { value }, inner as ComponentChildren);
    }
  }

  return inner;
}

export const preactRenderer: PrachtRenderer = definePrachtRenderer({
  id: "preact",
  h: preactH as PrachtRenderer["h"],
  hydrate: preactHydrate as PrachtRenderer["hydrate"],
  render: preactRender as PrachtRenderer["render"],
  createContext: preactCreateContext as PrachtRenderer["createContext"],
  Fragment: Fragment as unknown as PrachtRenderer["Fragment"],
  Component: Component as unknown as PrachtRenderer["Component"],
  Suspense: BaseSuspense as unknown as PrachtRenderer["Suspense"],
  lazy: baseLazy as unknown as PrachtRenderer["lazy"],
  server: {
    composePage,
    async renderToString(tree) {
      const renderToString = await getRenderToStringAsync();
      return renderToString(tree as VNode);
    },
    async renderToStream(tree) {
      const renderToReadableStream = await getRenderToReadableStream();
      return renderToReadableStream(tree as VNode) as RenderToReadableStreamHandle;
    },
  },
  client: {
    hydrateApp(tree, container) {
      preactHydrate(tree as VNode, container);
    },
    renderApp(tree, container) {
      preactRender(tree as VNode, container);
    },
    hydrateIsland(Component, props, container) {
      preactHydrate(preactH(Component as FunctionComponent, props), container);
    },
    mountFragment(tree, container) {
      preactRender(tree as VNode, container);
    },
  },
  vite: {
    id: "preact",
    plugins() {
      return [];
    },
    dedupe: ["preact", "preact-render-to-string"],
    vendorChunkTest: /node_modules[\\/]preact/,
    jsxImportSource: "preact",
  },
  configure(opts) {
    const options = preactOptions as Record<string, unknown>;
    if (opts.errorBoundaries !== undefined) {
      options.errorBoundaries = opts.errorBoundaries;
    }
    if (opts.vnode) {
      const prev = options.vnode as ((vnode: unknown) => void) | undefined;
      options.vnode = (vnode: unknown) => {
        opts.vnode!(vnode);
        prev?.(vnode);
      };
    }
    if (opts.__b) {
      const prev = options.__b as ((vnode: unknown) => void) | undefined;
      options.__b = (vnode: unknown) => {
        opts.__b!(vnode);
        prev?.(vnode);
      };
    }
    if (opts.__c) {
      const prev = options.__c as ((vnode: unknown, q: unknown) => void) | undefined;
      options.__c = (vnode: unknown, q: unknown) => {
        opts.__c!(vnode, q);
        prev?.(vnode, q);
      };
    }
    if (opts.__e) {
      const prev = options.__e as
        | ((err: unknown, n: unknown, o: unknown, i?: unknown) => void)
        | undefined;
      options.__e = (err: unknown, n: unknown, o: unknown, i?: unknown) => {
        opts.__e!(err, n, o, i);
        prev?.(err, n, o, i);
      };
    }
  },
  getOptions() {
    return preactOptions as Record<string, unknown>;
  },
});

/** Ensure the Preact renderer is the active default. */
export function ensurePreactRenderer(): PrachtRenderer {
  setRenderer(preactRenderer);
  return preactRenderer;
}

// Self-register on import so existing apps keep working without an explicit
// `pracht({ renderer })` option.
ensurePreactRenderer();

export { getRenderToStringAsync, getRenderToReadableStream };

/** Re-export Preact primitives for packages that still import from the seam. */
export {
  Component,
  Fragment,
  preactH as h,
  preactHydrate as hydrate,
  preactRender as render,
  preactCreateContext as createContext,
  preactOptions as options,
};

export type { ComponentChildren, FunctionComponent, VNode, RendererComponent };
