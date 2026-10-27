import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { assertFactoryRepoTargeting } from "../agent/lib/factory-repo-guard.js";

const factoryRepoConstant = /FACTORY_REPO/;

test("FACTORY_REPO accepts owner/repo form", async () => {
  process.env.FACTORY_REPO = "acme/widgets";
  const { FACTORY_REPO, factoryRepo } = await import(
    "../agent/lib/constants.js"
  );
  assert.equal(FACTORY_REPO, "acme/widgets");
  assert.deepEqual(factoryRepo, { owner: "acme", repo: "widgets" });
});

test("station sources do not hardcode flow-factory when target differs", () => {
  assertFactoryRepoTargeting("acme/widgets");
});

test("repo sandbox clones FACTORY_REPO constant", () => {
  const text = readFileSync(
    join(import.meta.dirname, "..", "agent/lib/github/repo-sandbox.ts"),
    "utf8"
  );
  assert.match(text, factoryRepoConstant);
});
