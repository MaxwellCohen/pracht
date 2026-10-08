#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const name = process.argv[2] ?? "fels-app";
const root = resolve(process.cwd(), name);

if (existsSync(root)) {
  console.error(`create-fels: directory already exists: ${root}`);
  process.exit(1);
}

mkdirSync(join(root, "src/routes"), { recursive: true });
mkdirSync(join(root, "src/shells"), { recursive: true });

writeFileSync(
  join(root, "package.json"),
  JSON.stringify(
    {
      name,
      private: true,
      type: "module",
      scripts: {
        dev: "pracht dev",
        build: "pracht build",
        preview: "pracht preview",
      },
      dependencies: {
        fels: "^0.1.0",
        "@pracht/adapter-node": "^0.4.4",
        "@pracht/core": "^0.18.0",
        "@pracht/solid": "^0.1.0",
        "@solidjs/web": "2.0.0-rc.14",
        "solid-js": "2.0.0-rc.14",
      },
      devDependencies: {
        "@pracht/cli": "^1.14.0",
        "@pracht/vite-plugin": "^0.13.0",
        vite: "^8.0.0",
        typescript: "^5.8.0",
      },
    },
    null,
    2,
  ) + "\n",
);

writeFileSync(
  join(root, "vite.config.ts"),
  `import { defineConfig } from "vite";
import { fels } from "fels/vite";
import { nodeAdapter } from "@pracht/adapter-node";

export default defineConfig({
  plugins: [fels({ adapter: nodeAdapter() })],
});
`,
);

writeFileSync(
  join(root, "tsconfig.json"),
  JSON.stringify(
    {
      compilerOptions: {
        target: "ESNext",
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "preserve",
        jsxImportSource: "@solidjs/web",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        types: ["vite/client"],
      },
      include: ["src", "vite.config.ts"],
    },
    null,
    2,
  ) + "\n",
);

writeFileSync(
  join(root, "src/routes.ts"),
  `import { defineApp, route } from "fels";

export const app = defineApp({
  shells: {
    public: () => import("./shells/public.tsx"),
  },
  routes: [
    route("/", () => import("./routes/home.tsx"), { render: "ssr" }),
  ],
});
`,
);

writeFileSync(
  join(root, "src/shells/public.tsx"),
  `import type { ShellProps } from "fels";

export function Shell(props: ShellProps) {
  return (
    <div class="shell">
      <header>
        <strong>Fels</strong>
      </header>
      <main>{props.children}</main>
    </div>
  );
}

export function head() {
  return {
    title: "Fels App",
    meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  };
}
`,
);

writeFileSync(
  join(root, "src/routes/home.tsx"),
  `import { createSignal } from "solid-js";
import type { RouteComponentProps } from "fels";

export async function loader() {
  return { message: "Hello from Fels" };
}

export default function Home(props: RouteComponentProps<typeof loader>) {
  const [count, setCount] = createSignal(0);
  return (
    <section>
      <h1>{props.data.message}</h1>
      <p>Solid 2.0 + Pracht.</p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Count: {count()}
      </button>
    </section>
  );
}
`,
);

writeFileSync(
  join(root, "README.md"),
  `# ${name}

A [Fels](https://github.com/JoviDeCroock/pracht) app — Pracht with SolidJS 2.0.

\`\`\`bash
pnpm install
pnpm dev
\`\`\`
`,
);

console.log(`Created ${name}/`);
console.log(`  cd ${name} && pnpm install && pnpm dev`);
