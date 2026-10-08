/**
 * Pluggable UI renderer contract.
 *
 * Core reaches the active renderer through `getRenderer()`. In apps, the Vite
 * plugin resolves `virtual:pracht/renderer` to the package selected via
 * `pracht({ renderer })`. Until a second renderer is wired, the default is the
 * built-in Preact implementation.
 */

/** Opaque tree node produced by a renderer. */
export type RendererTree = unknown;

export type RendererComponent<P = Record<string, unknown>> = (
  props: P & { children?: unknown },
) => RendererTree | null | undefined;

export type RendererClassComponent = new (...args: any[]) => {
  render(): RendererTree | null | undefined;
  props: any;
  context: any;
  state: any;
  setState(state: any): void;
};

export interface RenderToReadableStreamHandle {
  getReader(): ReadableStreamDefaultReader<Uint8Array>;
  allReady: Promise<void>;
}

export interface RendererContext<T> {
  Provider: RendererComponent<{ value: T; children?: unknown }>;
  Consumer?: RendererComponent<{ children: (value: T) => RendererTree }>;
}

export interface ComposePageOptions {
  Root?: RendererComponent<{ state: unknown; children?: unknown }> | null;
  Shell?: RendererComponent<{ children?: unknown }> | null;
  Loading?: RendererComponent | null;
  Component?: RendererComponent | null;
  ErrorBoundary?: RendererComponent<{ error: Error }> | null;
  componentProps?: Record<string, unknown>;
  rootState?: unknown;
  providers?: Array<{
    Context: RendererContext<unknown> | { Provider: RendererComponent<{ value: unknown; children?: unknown }> };
    value: unknown;
  }>;
  islands?: boolean;
}

export interface PrachtRendererServer {
  composePage(options: ComposePageOptions): RendererTree;
  renderToString(tree: RendererTree): Promise<string>;
  renderToStream(tree: RendererTree): Promise<RenderToReadableStreamHandle>;
  islandBoundary?(
    id: string,
    Component: RendererComponent,
    props: Record<string, unknown>,
    strategy?: string,
  ): RendererTree;
  serverIslandBoundary?(
    id: string,
    Component: RendererComponent,
    props: Record<string, unknown>,
    fallback?: RendererTree,
  ): RendererTree;
}

export interface PrachtRendererClient {
  hydrateApp(tree: RendererTree, container: Element | Document | DocumentFragment): void;
  renderApp(tree: RendererTree, container: Element | Document | DocumentFragment): void;
  hydrateIsland(
    Component: RendererComponent,
    props: Record<string, unknown>,
    container: Element,
  ): void;
  mountFragment?(tree: RendererTree, container: Element): void;
}

export interface PrachtRendererVite {
  id: string;
  plugins(): unknown[];
  dedupe: string[];
  vendorChunkTest: RegExp;
  hmrTransform?: unknown;
  islandTransform?: unknown;
  jsxImportSource?: string;
}

export interface PrachtRenderer {
  id: string;
  /** createElement equivalent — used by core for providers, shells, routes. */
  h(
    type: string | RendererComponent | RendererClassComponent | symbol,
    props?: Record<string, unknown> | null,
    ...children: unknown[]
  ): RendererTree;
  hydrate(tree: RendererTree, container: Element | Document | DocumentFragment): void;
  render(tree: RendererTree, container: Element | Document | DocumentFragment): void;
  createContext<T>(defaultValue: T): RendererContext<T>;
  Fragment: string | symbol | RendererComponent;
  Component?: RendererClassComponent;
  Suspense?: RendererComponent<{ fallback?: RendererTree; children?: unknown }>;
  lazy?: <T extends RendererComponent>(
    loader: () => Promise<{ default: T }>,
  ) => T;
  server: PrachtRendererServer;
  client: PrachtRendererClient;
  vite?: PrachtRendererVite;
  /** Process-wide renderer options (Preact `options` today). */
  configure?(options: {
    errorBoundaries?: boolean;
    vnode?: (vnode: unknown) => void;
    __b?: (vnode: unknown) => void;
    __c?: (vnode: unknown, commitQueue: unknown) => void;
    __e?: (err: unknown, newVNode: unknown, oldVNode: unknown, errorInfo?: unknown) => void;
  }): void;
  /** Access underlying options object for vnode-hook chaining (Preact). */
  getOptions?(): Record<string, unknown>;
}

let activeRenderer: PrachtRenderer | null = null;

export function setRenderer(renderer: PrachtRenderer): void {
  activeRenderer = renderer;
}

export function getRenderer(): PrachtRenderer {
  if (!activeRenderer) {
    // Lazy default so importing core without a renderer still works in tests
    // and in packages that only need non-UI APIs.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    throw new Error(
      "[pracht] No UI renderer registered. Install @pracht/preact or @pracht/solid and pass it to pracht({ renderer }), or import the renderer package so it self-registers.",
    );
  }
  return activeRenderer;
}

export function tryGetRenderer(): PrachtRenderer | null {
  return activeRenderer;
}

/** @internal Reset for tests. */
export function _resetRendererForTesting(): void {
  activeRenderer = null;
}

/**
 * Factory helper for renderer packages.
 * Validates the required surface and returns the object unchanged.
 */
export function definePrachtRenderer(renderer: PrachtRenderer): PrachtRenderer {
  if (!renderer?.id || !renderer.h || !renderer.server || !renderer.client) {
    throw new Error("[pracht] definePrachtRenderer: renderer is missing required fields");
  }
  return renderer;
}
