# create-fels

Scaffold a [Fels](../fels) (Pracht + SolidJS 2.0) app.

```bash
pnpm create fels my-app
# or
npx create-fels my-app
```

## Preview packages (pkg.pr.new)

When `fels` is not on npm yet — or you want a PR build — run the scaffolder from
[pkg.pr.new](https://pkg.pr.new). The CLI detects that URL and writes matching
preview install specs for `fels`, `@pracht/solid`, `@pracht/core`, and the rest
of the stack, then runs install:

```bash
pnpm dlx https://pkg.pr.new/<owner>/pracht/create-fels@<sha> my-app
# or
npx https://pkg.pr.new/<owner>/pracht/create-fels@<sha> my-app
```

If detection fails, set `PKG_PR_NEW` to the same create-fels URL.
