import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Find the pkg.pr.new tarball URL this create-* package was installed from.
 * Override with `PKG_PR_NEW=<full create-* pkg.pr.new URL>` when detection fails.
 *
 * @param {string} packageName e.g. `create-pracht`
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
  const match = /pkg\.pr\.new\/(?:[^/@]+\/[^/@]+\/)?(.+)@[^@/]+$/.exec(packageUrl);
  if (!match?.[1]) {
    throw new Error(`cannot parse package name from pkg.pr.new URL: ${packageUrl}`);
  }
  return match[1];
}

/**
 * @param {string} packageUrl
 * @param {string} fromName
 * @param {string} toName
 */
export function siblingPkgPrNewUrl(packageUrl, fromName, toName) {
  const marker = `${fromName}@`;
  if (!packageUrl.includes(marker)) {
    throw new Error(`pkg.pr.new URL does not contain ${marker}: ${packageUrl}`);
  }
  return packageUrl.replace(marker, `${toName}@`);
}
