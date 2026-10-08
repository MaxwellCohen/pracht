import { describe, expect, it, beforeEach } from "vitest";
import {
  createStore,
  createRouteStore,
  createHydrationStore,
  getRenderer,
  setRenderer,
  tryGetRenderer,
  _resetRendererForTesting,
  ensurePreactRenderer,
  definePrachtRenderer,
} from "../src/index.ts";

describe("framework-free stores", () => {
  it("notifies subscribers on set", () => {
    const store = createStore(0);
    const seen: number[] = [];
    const unsub = store.subscribe(() => seen.push(store.get()));
    store.set(1);
    store.set((n) => n + 1);
    unsub();
    store.set(99);
    expect(seen).toEqual([1, 2]);
    expect(store.get()).toBe(99);
  });

  it("skips notify when the value is unchanged", () => {
    const store = createStore("a");
    let calls = 0;
    store.subscribe(() => {
      calls++;
    });
    store.set("a");
    expect(calls).toBe(0);
  });

  it("creates typed route and hydration stores", () => {
    const route = createRouteStore({ path: "/", search: "", data: { ok: true }, pending: false, error: null });
    expect(route.get().data?.ok).toBe(true);
    const hydration = createHydrationStore();
    expect(hydration.get().hydrated).toBe(false);
  });
});

describe("renderer seam", () => {
  beforeEach(() => {
    _resetRendererForTesting();
    ensurePreactRenderer();
  });

  it("registers the Preact renderer by default", () => {
    expect(getRenderer().id).toBe("preact");
    expect(tryGetRenderer()?.id).toBe("preact");
  });

  it("allows swapping renderers", () => {
    const fake = definePrachtRenderer({
      id: "fake",
      h: () => null,
      hydrate() {},
      render() {},
      createContext: <T,>(v: T) => ({ Provider: (() => null) as any, value: v }) as any,
      Fragment: "fragment",
      server: {
        composePage: () => null,
        renderToString: async () => "",
        renderToStream: async () => ({
          getReader: () => new ReadableStream().getReader(),
          allReady: Promise.resolve(),
        }),
      },
      client: {
        hydrateApp() {},
        renderApp() {},
        hydrateIsland() {},
      },
    });
    setRenderer(fake);
    expect(getRenderer().id).toBe("fake");
  });
});
