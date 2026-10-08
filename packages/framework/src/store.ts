/**
 * Framework-free reactive stores. Renderers wrap these with idiomatic hooks
 * (Preact `useState`/`useSyncExternalStore`, Solid signals/stores).
 */

export type StoreSubscriber = () => void;
export type StoreUnsubscribe = () => void;

export interface Store<T> {
  get(): T;
  set(next: T | ((prev: T) => T)): void;
  subscribe(listener: StoreSubscriber): StoreUnsubscribe;
}

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<StoreSubscriber>();

  return {
    get() {
      return value;
    },
    set(next) {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(value) : next;
      if (Object.is(resolved, value)) return;
      value = resolved;
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Snapshot of the active route for the client router. */
export interface RouteStoreSnapshot<TData = unknown> {
  path: string;
  search: string;
  data: TData | undefined;
  pending: boolean;
  error: Error | null;
}

export function createRouteStore<TData = unknown>(
  initial: RouteStoreSnapshot<TData>,
): Store<RouteStoreSnapshot<TData>> {
  return createStore(initial);
}

/** Navigation progress for pending transitions. */
export interface NavigationStoreSnapshot {
  pending: boolean;
  href: string | null;
}

export function createNavigationStore(
  initial: NavigationStoreSnapshot = { pending: false, href: null },
): Store<NavigationStoreSnapshot> {
  return createStore(initial);
}

/** Hydration lifecycle for full-page mounts. */
export interface HydrationStoreSnapshot {
  hydrating: boolean;
  hydrated: boolean;
  suspensionCount: number;
}

export function createHydrationStore(
  initial: HydrationStoreSnapshot = {
    hydrating: false,
    hydrated: false,
    suspensionCount: 0,
  },
): Store<HydrationStoreSnapshot> {
  return createStore(initial);
}
