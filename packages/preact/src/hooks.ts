/**
 * Preact-idiomatic hooks over core framework-free stores.
 * Re-exports the existing @pracht/core browser hooks for a stable import path
 * once apps migrate off `@pracht/core` for UI APIs.
 */
export {
  useRouteData,
  useRouteSearch,
  useIsHydrated,
  useIsHydrationComplete,
  useNavigate,
  Link,
  Form,
  Script,
  ErrorBoundary,
  Suspense,
  lazy,
} from "@pracht/core";

export type { NavigateFn } from "@pracht/core";
