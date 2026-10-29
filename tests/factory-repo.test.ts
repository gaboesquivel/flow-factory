import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const factoryRepoConstant = /FACTORY_REPO/;
const FLOW_FACTORY_REPO = "gaboesquivel/flow-factory";

// Station sandboxes and instructions must target FACTORY_REPO, never this
// factory's own repository. Checked here rather than at runtime: deployments
// ship bundled code, not the agent's source files.
const TARGETING_PATHS = [
  "lib/github/repo-sandbox.ts",
  "lib/github/git-remote.ts",
  "subagents/implementer/instructions.md",
  "subagents/analyst/instructions.md",
  "subagents/reviewer/instructions.md",
] as const;

test("FACTORY_REPO accepts owner/repo form", async () => {
  process.env.FACTORY_REPO = "acme/widgets";
  const { FACTORY_REPO, factoryRepo } = await import(
    "../agent/lib/constants.js"
  );
  assert.equal(FACTORY_REPO, "acme/widgets");
  assert.deepEqual(factoryRepo, { owner: "acme", repo: "widgets" });
});

test("station sources do not hardcode the factory's own repository", () => {
  for (const relative of TARGETING_PATHS) {
    const text = readFileSync(
      join(import.meta.dirname, "..", "agent", relative),
      "utf8"
    );
    assert.ok(
      !text.includes(FLOW_FACTORY_REPO),
      `${relative} must not hardcode '${FLOW_FACTORY_REPO}'.`
    );
  }
});

test("repo sandbox clones FACTORY_REPO constant", () => {
  const text = readFileSync(
    join(import.meta.dirname, "..", "agent/lib/github/repo-sandbox.ts"),
    "utf8"
  );
  assert.match(text, factoryRepoConstant);
});
