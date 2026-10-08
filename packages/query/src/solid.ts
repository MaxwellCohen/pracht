/**
 * Solid entry for `@pracht/query`.
 *
 * Uses `@tanstack/solid-query`. Note: TanStack's peer currently lists
 * `solid-js@^1.6`; with Solid 2.0 (pinned by `@pracht/solid`) you may need a
 * pnpm peer dependency override until TanStack updates its peer range.
 */
import { CAPABILITY_SETTLED_EVENT } from "@pracht/capabilities";
import type { RootModule, RootProps, RootSetupArgs } from "@pracht/core";
import {
  dehydrate,
  hydrate,
  QueryClient,
  QueryClientProvider,
  type DehydratedState,
  type DehydrateOptions,
  type HydrateOptions,
  type QueryClientConfig,
} from "@tanstack/solid-query";
import { onCleanup } from "solid-js";
import h from "@solidjs/h";

export interface QueryRootState {
  queryClient: QueryClient;
}

export interface QueryRootOptions {
  client?: QueryClientConfig | ((args: RootSetupArgs) => QueryClientConfig);
  dehydrate?: DehydrateOptions;
  hydrate?: HydrateOptions;
  invalidateOnCapability?: boolean;
}

export const DEFAULT_STALE_TIME = 60_000;

export type QueryRoot = Required<
  Pick<RootModule<QueryRootState>, "setup" | "Root" | "dehydrate" | "hydrate">
>;

export function createQueryRoot(options: QueryRootOptions = {}): QueryRoot {
  const invalidateOnCapability = options.invalidateOnCapability !== false;

  return {
    setup(args) {
      const config =
        typeof options.client === "function" ? options.client(args) : (options.client ?? {});
      return {
        queryClient: new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: DEFAULT_STALE_TIME,
              ...(config.defaultOptions?.queries ?? {}),
            },
            ...(config.defaultOptions ?? {}),
          },
          ...config,
        }),
      };
    },
    Root(props: RootProps<QueryRootState>) {
      if (invalidateOnCapability && typeof window !== "undefined") {
        const onSettled = () => {
          void props.state.queryClient.invalidateQueries();
        };
        window.addEventListener(CAPABILITY_SETTLED_EVENT, onSettled);
        onCleanup(() => window.removeEventListener(CAPABILITY_SETTLED_EVENT, onSettled));
      }
      return h(QueryClientProvider as any, { client: props.state.queryClient }, props.children);
    },
    async dehydrate(state) {
      return dehydrate(state.queryClient, options.dehydrate);
    },
    async hydrate(state, snapshot) {
      if (snapshot) {
        hydrate(state.queryClient, snapshot as DehydratedState, options.hydrate);
      }
    },
  };
}
