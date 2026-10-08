import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { findPkgPrNewPackageUrl, pkgPrNewSpecs } from "./pkg-pr-new.js";

/** Workspace packages a Fels app depends on. */
export const FELS_WORKSPACE_PACKAGES = [
  "fels",
  "@pracht/solid",
  "@pracht/core",
  "@pracht/adapter-node",
  "@pracht/cli",
  "@pracht/vite-plugin",
];

/** Semver fallbacks once packages are on npm. */
export const FELS_FALLBACK_RANGES = {
  fels: "^0.1.0",
  "@pracht/solid": "^0.1.0",
  "@pracht/core": "^0.18.0",
  "@pracht/adapter-node": "^0.4.4",
  "@pracht/cli": "^1.14.0",
  "@pracht/vite-plugin": "^0.13.0",
};

/**
 * Prefer pkg.pr.new sibling URLs when this create-fels was installed from a
 * preview tarball, so `pnpm dlx https://pkg.pr.new/.../create-fels@sha` scaffolds
 * an app that installs the matching preview packages (fels is not on npm yet).
 *
 * @param {string} [fromUrl]
 */
export function resolveFelsDependencySpecs(fromUrl = import.meta.url) {
  const pkgPrNewUrl = findPkgPrNewPackageUrl("create-fels", fromUrl);
  if (pkgPrNewUrl) {
    return {
      source: "pkg.pr.new",
      url: pkgPrNewUrl,
      specs: pkgPrNewSpecs(pkgPrNewUrl, "create-fels", FELS_WORKSPACE_PACKAGES),
    };
  }

  /** @type {Record<string, string>} */
  const specs = {};
  for (const name of FELS_WORKSPACE_PACKAGES) {
    specs[name] = FELS_FALLBACK_RANGES[name] ?? "latest";
  }
  return { source: "registry", specs };
}

/** Directory containing create-fels's own package.json. */
export function createFelsPackageRoot(fromUrl = import.meta.url) {
  return resolve(dirname(fileURLToPath(fromUrl)), "..");
}
