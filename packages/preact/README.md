# `@pracht/preact`

Preact UI renderer for [Pracht](https://github.com/JoviDeCroock/pracht).

## Create a new project

```bash
npm create pracht@latest my-app
# or
pnpm create pracht my-app
```

On an open PR, continuous releases post scaffold commands that run the PR's
`create-pracht` build:

```bash
npx https://pkg.pr.new/create-pracht@<sha> my-app
# or
pnpm dlx https://pkg.pr.new/create-pracht@<sha> my-app
```

Then install this PR's packages (URLs are in the bot comment), for example:

```bash
pnpm add https://pkg.pr.new/@pracht/preact@<sha>
```

## Usage

```ts
import { pracht } from "@pracht/vite-plugin";
import { preact } from "@pracht/preact/vite";

export default {
  plugins: [pracht({ renderer: preact() })],
};
```

Omitting `renderer` keeps the historical built-in Preact preset — this package
is the explicit, extractable form of that same renderer.
