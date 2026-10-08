import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Find the pkg.pr.new tarball URL this create-* package was installed from.
 * `pnpm dlx https://pkg.pr.new/.../create-fels@sha` stores that URL on the
 * ephemeral dlx package.json that depends on us.
 *
 * Override with `PKG_PR_NEW=<full create-* pkg.pr.new URL>` when detection fails.
 *
 * @param {string} packageName e.g. `create-fels` or `create-pracht`
 * @param {string} fromUrl `import.meta.url` of the caller
 * @returns {string | null}
 */
export function findPkgPrNewPackageUrl(packageName, fromUrl = import.meta.url) {
  const envUrl = process.env.PKG_PR_NEW?.trim();
  if (envUrl?.includes("pkg.pr.new")) {
    return envUrl.includes(`${packageName}@`)
      ? envUrl
      : siblingPkgPrNewUrl(envUrl, packageNameFromPkgPrNewUrl(envUrl), packageName);
  }

  const resolvedEnv = process.env.npm_package_resolved;
  if (typeof resolvedEnv === "string" && resolvedEnv.includes("pkg.pr.new")) {
    return resolvedEnv.includes(`${packageName}@`)
      ? resolvedEnv
      : siblingPkgPrNewUrl(resolvedEnv, packageNameFromPkgPrNewUrl(resolvedEnv), packageName);
  }

  let dir = fileURLToPath(new URL(".", fromUrl));
  for (let i = 0; i < 12; i++) {
    const pkgPath = join(dir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
        for (const bag of [pkg.dependencies, pkg.devDependencies, pkg.optionalDependencies]) {
          const spec = bag?.[packageName];
          if (typeof spec === "string" && spec.includes("pkg.pr.new")) {
            return spec;
          }
        }
      } catch {
        // keep walking
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return null;
}

/**
 * @param {string} packageUrl
 * @returns {string}
 */
export function packageNameFromPkgPrNewUrl(packageUrl) {
  // https://pkg.pr.new/owner/repo/create-fels@sha
  // https://pkg.pr.new/create-fels@sha
  // https://pkg.pr.new/owner/repo/@pracht/core@sha
  // https://pkg.pr.new/@pracht/core@sha
  const match = /pkg\.pr\.new\/(?:[^/@]+\/[^/@]+\/)?(.+)@[^@/]+$/.exec(packageUrl);
  if (!match?.[1]) {
    throw new Error(`cannot parse package name from pkg.pr.new URL: ${packageUrl}`);
  }
  return match[1];
}

/**
 * Rewrite a pkg.pr.new URL for one published package into the URL for another
 * package at the same commit/PR ref.
 *
 * @param {string} packageUrl
 * @param {string} fromName package name currently in the URL
 * @param {string} toName package to point at instead
 */
export function siblingPkgPrNewUrl(packageUrl, fromName, toName) {
  const marker = `${fromName}@`;
  if (!packageUrl.includes(marker)) {
    throw new Error(`pkg.pr.new URL does not contain ${marker}: ${packageUrl}`);
  }
  return packageUrl.replace(marker, `${toName}@`);
}

/**
 * Map workspace package names to pkg.pr.new install specs.
 *
 * @param {string} createPackageUrl
 * @param {string} createPackageName
 * @param {readonly string[]} packageNames
 * @returns {Record<string, string>}
 */
export function pkgPrNewSpecs(createPackageUrl, createPackageName, packageNames) {
  /** @type {Record<string, string>} */
  const specs = {};
  for (const name of packageNames) {
    specs[name] = siblingPkgPrNewUrl(createPackageUrl, createPackageName, name);
  }
  return specs;
}
