# `@pracht/solid`

SolidJS **2.0** UI renderer for Pracht (used by [fels](../fels)).

Pinned to `solid-js@2.0.0-rc.14` / `@solidjs/web@2.0.0-rc.14`.

```ts
import { pracht } from "@pracht/vite-plugin";
import { solid } from "@pracht/solid/vite";

export default {
  plugins: [pracht({ renderer: solid() })],
};
```

Or use the `fels` shorthand:

```ts
import { fels } from "fels/vite";
export default { plugins: [fels()] };
```
