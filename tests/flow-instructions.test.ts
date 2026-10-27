import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const agentRoot = join(import.meta.dirname, "..", "agent");
const flowJudgmentHeading = /## Flow judgment/;
const flowFactoryName = /Flow Factory/;
const noSecondEngine = /not a second workflow engine/;

const stationFiles = [
  "subagents/classifier/instructions.md",
  "subagents/analyst/instructions.md",
  "subagents/implementer/instructions.md",
  "subagents/reviewer/instructions.md",
] as const;

test("station instructions include Flow judgment sections", () => {
  for (const relative of stationFiles) {
    const text = readFileSync(join(agentRoot, relative), "utf8");
    assert.match(text, flowJudgmentHeading);
  }
});

test("orchestrator instructions describe Flow Factory without mandatory ceremonies", () => {
  const text = readFileSync(join(agentRoot, "instructions.ts"), "utf8");
  assert.match(text, flowFactoryName);
  assert.match(text, noSecondEngine);
});
