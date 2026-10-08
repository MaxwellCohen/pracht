# fels

**Fels** is Pracht with a SolidJS 2.0 renderer — same adapters, loaders,
capabilities, and route manifest; Solid components and signals instead of
Preact.

```bash
pnpm create fels my-app
cd my-app && pnpm install && pnpm dev
```

```ts
// vite.config.ts
import { fels } from "fels/vite";
export default { plugins: [fels()] };
```
