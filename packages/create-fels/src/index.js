import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { resolveFelsDependencySpecs } from "./deps.js";

/**
 * @param {string[]} argv
 */
export function parseArgs(argv) {
  const options = {
    dir: undefined,
    skipInstall: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--skip-install") {
      options.skipInstall = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    if (options.dir != null) {
      throw new Error(`Unexpected extra argument: ${arg}`);
    }
    options.dir = arg;
  }

  return options;
}

export function getPackageManager(userAgent = process.env.npm_config_user_agent ?? "") {
  if (userAgent.startsWith("pnpm")) return "pnpm";
  if (userAgent.startsWith("yarn")) return "yarn";
  if (userAgent.startsWith("bun") || process.versions.bun) return "bun";
  return "npm";
}

/**
 * @param {string[]} [argv]
 */
export async function run(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    printHelp();
    return { ok: true };
  }

  const name = options.dir ?? "fels-app";
  const root = resolve(process.cwd(), name);
  const packageManager = getPackageManager();
  const deps = resolveFelsDependencySpecs();

  if (existsSync(root)) {
    console.error(`create-fels: directory already exists: ${root}`);
    process.exitCode = 1;
    return { ok: false };
  }

  if (deps.source === "registry") {
    console.warn(
      "create-fels: scaffolding with npm registry ranges. fels / @pracht/solid may not be published yet.",
    );
    console.warn(
      "  Prefer a pkg.pr.new preview: pnpm dlx https://pkg.pr.new/<owner>/pracht/create-fels@<sha> my-app",
    );
    console.warn("");
  } else {
    console.log(`create-fels: using pkg.pr.new preview packages from`);
    console.log(`  ${deps.url}`);
    console.log("");
  }

  writeProject(root, name, deps.specs);

  let installSucceeded = false;
  if (!options.skipInstall) {
    console.log(`Installing dependencies with ${packageManager}...`);
    installSucceeded = await installDependencies(root, packageManager);
    if (!installSucceeded) {
      console.error(`create-fels: ${packageManager} install failed`);
      process.exitCode = 1;
    }
  }

  const installCmd = packageManager === "npm" ? "npm install" : `${packageManager} install`;
  const devCmd = packageManager === "npm" ? "npm run dev" : `${packageManager} dev`;

  console.log("");
  console.log(`Created ${name}/`);
  if (options.skipInstall || !installSucceeded) {
    console.log(`  cd ${name} && ${installCmd} && ${devCmd}`);
  } else {
    console.log(`  cd ${name} && ${devCmd}`);
  }

  return { ok: installSucceeded || options.skipInstall, root, deps };
}

/**
 * @param {string} root
 * @param {string} name
 * @param {Record<string, string>} specs
 */
export function writeProject(root, name, specs) {
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
          fels: specs.fels,
          "@pracht/adapter-node": specs["@pracht/adapter-node"],
          "@pracht/core": specs["@pracht/core"],
          "@pracht/solid": specs["@pracht/solid"],
          "@solidjs/web": "2.0.0-rc.14",
          "solid-js": "2.0.0-rc.14",
        },
        devDependencies: {
          "@pracht/cli": specs["@pracht/cli"],
          "@pracht/vite-plugin": specs["@pracht/vite-plugin"],
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
}

/**
 * @param {string} targetDir
 * @param {string} packageManager
 */
async function installDependencies(targetDir, packageManager) {
  return await new Promise((resolveInstall) => {
    const child = spawn(packageManager, ["install"], {
      cwd: targetDir,
      stdio: "inherit",
    });
    child.on("close", (code) => resolveInstall(code === 0));
    child.on("error", () => resolveInstall(false));
  });
}

function printHelp() {
  console.log(`create-fels

Usage:
  create-fels [directory] [--skip-install]

Preview (pkg.pr.new):
  pnpm dlx https://pkg.pr.new/<owner>/pracht/create-fels@<sha> my-app
`);
}
