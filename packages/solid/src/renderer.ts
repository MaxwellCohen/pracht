/**
 * SolidJS 2.0 Pracht renderer.
 *
 * Solid has no virtual DOM. Framework-composed trees use `@solidjs/h`
 * hyperscript (returns thunks). User app code uses the `@solidjs/web` JSX
 * transform. Islands are compile-time transformed (see `./islands.ts`).
 */
import {
  createContext as solidCreateContext,
  lazy as solidLazy,
  Loading,
  Errored,
  type Component,
  type JSX,
} from "solid-js";
import {
  hydrate as solidHydrate,
  render as solidRender,
  renderToString as solidRenderToString,
  renderToStream as solidRenderToStream,
} from "@solidjs/web";
import h from "@solidjs/h";
import {
  definePrachtRenderer,
  setRenderer,
  type ComposePageOptions,
  type PrachtRenderer,
  type RendererTree,
  type RenderToReadableStreamHandle,
} from "@pracht/core";

type SolidFn = () => JSX.Element;

function asFn(tree: RendererTree): SolidFn {
  if (typeof tree === "function") return tree as SolidFn;
  return () => tree as JSX.Element;
}

function composePage(options: ComposePageOptions): RendererTree {
  const {
    Root,
    Shell,
    Loading: LoadingComp,
    Component: Comp,
    componentProps,
    rootState,
    providers,
  } = options;

  let inner: RendererTree;
  if (Comp) {
    inner = h(Comp as Component<any>, componentProps ?? {});
  } else if (LoadingComp) {
    inner = h(LoadingComp as Component<any>, {});
  } else {
    inner = () => null as unknown as JSX.Element;
  }

  if (Shell) {
    inner = h(Shell as Component<any>, null, inner);
  }

  if (Root) {
    inner = h(Root as Component<any>, { state: rootState }, inner);
  }

  if (providers) {
    for (let i = providers.length - 1; i >= 0; i--) {
      const { Context, value } = providers[i]!;
      const Provider = Context.Provider as Component<any>;
      inner = h(Provider, { value }, inner);
    }
  }

  return inner;
}

function textEncoderStreamFromString(html: string): RenderToReadableStreamHandle {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(html));
      controller.close();
    },
  });
  return {
    getReader: () => stream.getReader(),
    allReady: Promise.resolve(),
  };
}

async function renderTreeToString(tree: RendererTree): Promise<string> {
  const fn = asFn(tree);
  const result = solidRenderToString(fn);
  return typeof result === "string" ? result : await Promise.resolve(result as any);
}

async function renderTreeToStream(tree: RendererTree): Promise<RenderToReadableStreamHandle> {
  const fn = asFn(tree);
  const result = solidRenderToStream(fn);

  if (result && typeof (result as any).getReader === "function") {
    return result as RenderToReadableStreamHandle;
  }

  if (result && typeof (result as any).pipeTo === "function") {
    const webStream = result as ReadableStream<Uint8Array>;
    return {
      getReader: () => webStream.getReader(),
      allReady: Promise.resolve(),
    };
  }

  const html = typeof result === "string" ? result : await Promise.resolve(result as any);
  if (typeof html === "string") {
    return textEncoderStreamFromString(html);
  }

  if (html && typeof html.pipe === "function") {
    const webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        html.on("data", (chunk: Buffer | string) => {
          controller.enqueue(
            typeof chunk === "string" ? new TextEncoder().encode(chunk) : new Uint8Array(chunk),
          );
        });
        html.on("end", () => controller.close());
        html.on("error", (err: unknown) => controller.error(err));
      },
    });
    return {
      getReader: () => webStream.getReader(),
      allReady: new Promise<void>((resolve, reject) => {
        html.on("end", () => resolve());
        html.on("error", reject);
      }),
    };
  }

  throw new Error("[@pracht/solid] Unsupported renderToStream return type");
}

export const solidRenderer: PrachtRenderer = definePrachtRenderer({
  id: "solid",
  h: h as unknown as PrachtRenderer["h"],
  hydrate(tree, container) {
    // h(...) already returns a thunk — pass it straight to hydrate/render.
    solidHydrate(asFn(tree), container as Element);
  },
  render(tree, container) {
    solidRender(asFn(tree), container as Element);
  },
  createContext<T>(defaultValue: T) {
    const ctx = solidCreateContext(defaultValue);
    return {
      Provider: ((props: { value: T; children?: unknown }) => {
        const Provider = (ctx as any).Provider as Component<any>;
        return h(Provider, { value: props.value }, props.children);
      }) as any,
    };
  },
  Fragment: (h as any).Fragment ?? (((props: { children?: unknown }) => props.children) as any),
  Suspense: Loading as any,
  lazy: solidLazy as any,
  server: {
    composePage,
    renderToString: renderTreeToString,
    renderToStream: renderTreeToStream,
    islandBoundary(id, Component, props) {
      // Shared HTML contract uses <preact-island> markers during the migration
      // so the existing islands bootstrap can hydrate Solid islands too.
      return h(
        "preact-island",
        { "data-name": id, "data-props": JSON.stringify(props ?? {}) },
        h(Component as Component<any>, props ?? {}),
      );
    },
  },
  client: {
    hydrateApp(tree, container) {
      solidHydrate(asFn(tree), container as Element);
    },
    renderApp(tree, container) {
      solidRender(asFn(tree), container as Element);
    },
    hydrateIsland(Component, props, container) {
      solidHydrate(h(Component as Component<any>, props) as SolidFn, container);
    },
    mountFragment(tree, container) {
      solidRender(asFn(tree), container);
    },
  },
  vite: {
    id: "solid",
    plugins() {
      return [];
    },
    dedupe: ["solid-js", "@solidjs/web", "@solidjs/signals", "@solidjs/h"],
    vendorChunkTest: /node_modules[\\/](solid-js|@solidjs[\\/])/,
    jsxImportSource: "@solidjs/web",
  },
});

/** Ensure the Solid renderer is the active default. */
export function ensureSolidRenderer(): PrachtRenderer {
  setRenderer(solidRenderer);
  return solidRenderer;
}

export { Loading, Errored };
