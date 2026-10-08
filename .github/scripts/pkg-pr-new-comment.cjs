/**
 * Builds and upserts the pkg.pr.new PR comment.
 * Used by `.github/workflows/pkg-pr-new.yml` via actions/github-script.
 */

const BOT_COMMENT_IDENTIFIER = "<!-- pkg.pr.new -->";

/** Packages called out above the full list — Preact app surface. */
const HIGHLIGHT_PACKAGES = ["@pracht/preact", "@pracht/core", "@pracht/vite-plugin", "@pracht/cli"];

/**
 * @param {{ name: string, url: string }[]} packages
 * @param {string} name
 */
function findPackage(packages, name) {
  return packages.find((pkg) => pkg.name === name) ?? null;
}

/**
 * @param {{ name: string, url: string }} pkg
 * @param {'pnpm' | 'npm'} manager
 */
function installLine(pkg, manager) {
  return manager === "pnpm" ? `pnpm add ${pkg.url}` : `npm i ${pkg.url}`;
}

/**
 * @param {object} output
 * @param {{ owner: string, repo: string, sha: string }} meta
 */
function buildCommentBody(output, { owner, repo, sha }) {
  const packages = Array.isArray(output.packages) ? output.packages : [];
  const createPracht = findPackage(packages, "create-pracht");
  const createFels = findPackage(packages, "create-fels");
  const shortSha = sha.slice(0, 7);
  const commitUrl = `https://github.com/${owner}/${repo}/commit/${sha}`;

  const createBlock = [];
  if (createPracht) {
    createBlock.push(
      "### Create a new Preact project",
      "",
      "```sh",
      `npx ${createPracht.url} my-app`,
      `# or`,
      `pnpm dlx ${createPracht.url} my-app`,
      "```",
      "",
      "The scaffolder still resolves published `@pracht/*` ranges from npm. After scaffolding, swap in this PR's packages with the install commands below.",
      "",
    );
  }
  if (createFels) {
    createBlock.push(
      "### Create a new Fels (Solid) project",
      "",
      "```sh",
      `npx ${createFels.url} my-app`,
      `# or`,
      `pnpm dlx ${createFels.url} my-app`,
      "```",
      "",
    );
  }

  const highlight = HIGHLIGHT_PACKAGES.map((name) => findPackage(packages, name)).filter(Boolean);
  const highlightBlock =
    highlight.length === 0
      ? []
      : [
          "### Install the Preact stack from this PR",
          "",
          "```sh",
          ...highlight.map((pkg) => installLine(pkg, "pnpm")),
          "```",
          "",
        ];

  const other = packages.filter(
    (pkg) =>
      pkg.name !== "create-pracht" &&
      pkg.name !== "create-fels" &&
      !HIGHLIGHT_PACKAGES.includes(pkg.name),
  );

  const allLines = packages
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((pkg) => `- \`${pkg.name}\`: \`${pkg.url}\``)
    .join("\n");

  const otherBlock =
    other.length === 0
      ? []
      : [
          "<details>",
          "<summary>All published packages</summary>",
          "",
          allLines,
          "",
          "</details>",
          "",
        ];

  return [
    "## Preview this PR with [pkg.pr.new](https://pkg.pr.new)",
    "",
    ...createBlock,
    ...highlightBlock,
    ...otherBlock,
    `[View commit](${commitUrl}) (\`${shortSha}\`)`,
    "",
    BOT_COMMENT_IDENTIFIER,
  ].join("\n");
}

/** @param {{ github: any, context: any, body: string }} args */
async function createOrUpdateComment({ github, context, body }) {
  const issueNumber = context.issue.number;
  if (!issueNumber) {
    console.log("No issue number; skipping comment.");
    return;
  }

  const comments = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNumber,
    per_page: 100,
  });
  const existing = comments.data.find((comment) => comment.body?.includes(BOT_COMMENT_IDENTIFIER));

  if (existing) {
    await github.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: existing.id,
      body,
    });
    return;
  }

  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNumber,
    body,
  });
}

module.exports = {
  BOT_COMMENT_IDENTIFIER,
  buildCommentBody,
  createOrUpdateComment,
};
