import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

import { resolveFelsDependencySpecs } from "../src/deps.js";
import { writeProject } from "../src/index.js";
import {
  findPkgPrNewPackageUrl,
  packageNameFromPkgPrNewUrl,
  pkgPrNewSpecs,
  siblingPkgPrNewUrl,
} from "../src/pkg-pr-new.js";

const tempDirs = [];

afterEach(() => {
  while (tempDirs.length) {
    rmSync(tempDirs.pop(), { recursive: true, force: true });
  }
  delete process.env.PKG_PR_NEW;
});

function tempDir(prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

describe("pkg.pr.new URL helpers", () => {
  it("rewrites long-form create-fels URLs", () => {
    const url =
      "https://pkg.pr.new/MaxwellCohen/pracht/create-fels@b99a9fd47cf34d04ba43da8f7634c331e504fcea";
    expect(siblingPkgPrNewUrl(url, "create-fels", "fels")).toBe(
      "https://pkg.pr.new/MaxwellCohen/pracht/fels@b99a9fd47cf34d04ba43da8f7634c331e504fcea",
    );
    expect(siblingPkgPrNewUrl(url, "create-fels", "@pracht/core")).toBe(
      "https://pkg.pr.new/MaxwellCohen/pracht/@pracht/core@b99a9fd47cf34d04ba43da8f7634c331e504fcea",
    );
  });

  it("rewrites compact URLs", () => {
    expect(siblingPkgPrNewUrl("https://pkg.pr.new/create-fels@abc1234", "create-fels", "fels")).toBe(
      "https://pkg.pr.new/fels@abc1234",
    );
  });

  it("parses scoped and unscoped package names", () => {
    expect(
      packageNameFromPkgPrNewUrl("https://pkg.pr.new/MaxwellCohen/pracht/create-fels@sha"),
    ).toBe("create-fels");
    expect(
      packageNameFromPkgPrNewUrl("https://pkg.pr.new/MaxwellCohen/pracht/@pracht/core@sha"),
    ).toBe("@pracht/core");
    expect(packageNameFromPkgPrNewUrl("https://pkg.pr.new/@pracht/cli@sha")).toBe("@pracht/cli");
  });

  it("walks to the dlx package.json for the create-fels URL", () => {
    const root = tempDir("create-fels-dlx-");
    const createRoot = join(root, "node_modules", "create-fels", "src");
    mkdirSync(createRoot, { recursive: true });
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({
        dependencies: {
          "create-fels":
            "https://pkg.pr.new/MaxwellCohen/pracht/create-fels@b99a9fd47cf34d04ba43da8f7634c331e504fcea",
        },
      }),
    );
    writeFileSync(join(createRoot, "index.js"), "");
    const fromUrl = pathToFileURL(join(createRoot, "index.js")).href;
    expect(findPkgPrNewPackageUrl("create-fels", fromUrl)).toBe(
      "https://pkg.pr.new/MaxwellCohen/pracht/create-fels@b99a9fd47cf34d04ba43da8f7634c331e504fcea",
    );
  });
});

describe("resolveFelsDependencySpecs", () => {
  it("uses PKG_PR_NEW override for preview specs", () => {
    process.env.PKG_PR_NEW =
      "https://pkg.pr.new/MaxwellCohen/pracht/create-fels@b99a9fd47cf34d04ba43da8f7634c331e504fcea";
    const resolved = resolveFelsDependencySpecs();
    expect(resolved.source).toBe("pkg.pr.new");
    expect(resolved.specs.fels).toBe(
      "https://pkg.pr.new/MaxwellCohen/pracht/fels@b99a9fd47cf34d04ba43da8f7634c331e504fcea",
    );
    expect(resolved.specs["@pracht/cli"]).toBe(
      "https://pkg.pr.new/MaxwellCohen/pracht/@pracht/cli@b99a9fd47cf34d04ba43da8f7634c331e504fcea",
    );
  });
});

describe("writeProject", () => {
  it("embeds preview specs into package.json", () => {
    const root = tempDir("fels-app-");
    const specs = pkgPrNewSpecs(
      "https://pkg.pr.new/MaxwellCohen/pracht/create-fels@abc",
      "create-fels",
      [
        "fels",
        "@pracht/core",
        "@pracht/solid",
        "@pracht/adapter-node",
        "@pracht/cli",
        "@pracht/vite-plugin",
      ],
    );
    writeProject(root, "demo", specs);
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    expect(pkg.dependencies.fels).toBe("https://pkg.pr.new/MaxwellCohen/pracht/fels@abc");
    expect(pkg.dependencies["@pracht/core"]).toMatch(/@pracht\/core@abc$/);
    expect(pkg.devDependencies["@pracht/cli"]).toMatch(/@pracht\/cli@abc$/);
  });
});
