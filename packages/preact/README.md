# `@pracht/preact`

Preact UI renderer for [Pracht](https://github.com/JoviDeCroock/pracht).

```ts
import { pracht } from "@pracht/vite-plugin";
import { preact } from "@pracht/preact/vite";

export default {
  plugins: [pracht({ renderer: preact() })],
};
```

Omitting `renderer` keeps the historical built-in Preact preset — this package
is the explicit, extractable form of that same renderer.
