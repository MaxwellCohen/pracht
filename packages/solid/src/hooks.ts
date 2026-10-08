/**
 * Solid-idiomatic hooks over core framework-free stores.
 */
import { createSignal, createMemo, onCleanup, type Accessor } from "solid-js";
import type { Store } from "@pracht/core";

/** Subscribe a Solid signal to a framework-free store. */
export function useStore<T>(store: Store<T>): Accessor<T> {
  const [value, setValue] = createSignal(store.get(), { equals: false });
  const unsubscribe = store.subscribe(() => setValue(() => store.get()));
  onCleanup(unsubscribe);
  return value;
}

/**
 * Route data accessor. Apps should prefer the runtime context hooks once the
 * Solid client router is fully wired; this helper bridges store snapshots.
 */
export function useStoreField<T, K extends keyof T>(
  store: Store<T>,
  key: K,
): Accessor<T[K]> {
  const snapshot = useStore(store);
  return createMemo(() => snapshot()[key]);
}

export { Loading, Errored } from "./renderer.ts";
