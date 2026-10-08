const { strictEqual, match, doesNotMatch } = require("node:assert/strict");
const { buildCommentBody, BOT_COMMENT_IDENTIFIER } = require("./pkg-pr-new-comment.cjs");

const output = {
  packages: [
    { name: "create-pracht", url: "https://pkg.pr.new/create-pracht@abc1234" },
    { name: "create-fels", url: "https://pkg.pr.new/create-fels@abc1234" },
    { name: "@pracht/preact", url: "https://pkg.pr.new/@pracht/preact@abc1234" },
    { name: "@pracht/core", url: "https://pkg.pr.new/@pracht/core@abc1234" },
    { name: "@pracht/vite-plugin", url: "https://pkg.pr.new/@pracht/vite-plugin@abc1234" },
    { name: "@pracht/cli", url: "https://pkg.pr.new/@pracht/cli@abc1234" },
    { name: "@pracht/solid", url: "https://pkg.pr.new/@pracht/solid@abc1234" },
  ],
};

const body = buildCommentBody(output, {
  owner: "JoviDeCroock",
  repo: "pracht",
  sha: "abc1234deadbeef",
});

match(body, /npx https:\/\/pkg\.pr\.new\/create-pracht@abc1234 my-app/);
match(body, /pnpm dlx https:\/\/pkg\.pr\.new\/create-pracht@abc1234 my-app/);
match(body, /npx https:\/\/pkg\.pr\.new\/create-fels@abc1234 my-app/);
match(body, /pnpm add https:\/\/pkg\.pr\.new\/@pracht\/preact@abc1234/);
match(body, /pnpm add https:\/\/pkg\.pr\.new\/@pracht\/core@abc1234/);
match(body, /All published packages/);
match(body, /@pracht\/solid/);
match(body, new RegExp(BOT_COMMENT_IDENTIFIER));
doesNotMatch(body, /pnpm add https:\/\/pkg\.pr\.new\/create-pracht/);
strictEqual(body.includes("View commit"), true);

console.log("pkg-pr-new-comment.selftest.cjs: ok");
