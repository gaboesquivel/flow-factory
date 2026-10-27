import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { sweepOrphanWorktrees } from "../src/worktree.ts";

test("sweepOrphanWorktrees removes dirs not in active run list", async () => {
  const repoRoot = mkdtempSync(join(tmpdir(), "factory-wt-"));
  const keepId = "run-keep";
  const dropId = "run-drop";
  const base = join(repoRoot, ".data", "worktrees");
  mkdirSync(join(base, keepId), { recursive: true });
  mkdirSync(join(base, dropId), { recursive: true });
  writeFileSync(join(base, dropId, "stale.txt"), "x");

  const { removed } = await sweepOrphanWorktrees({
    repoRoot,
    activeRunIds: [keepId],
  });

  assert.deepEqual(removed, [dropId]);
});
