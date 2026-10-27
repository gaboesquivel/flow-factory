import assert from "node:assert/strict";
import test from "node:test";

import { defaultGithubConfig } from "../src/github/config.js";
import { mergeFactoryColumnLabels } from "../src/github/labels.js";
import { planTaskColumnWrite } from "../src/github/write-plan.js";

test("mergeFactoryColumnLabels replaces factory-column label", () => {
  assert.deepEqual(
    mergeFactoryColumnLabels({
      labels: ["bug", "factory-column:backlog", "priority:high"],
      column: "in_progress",
    }),
    ["bug", "priority:high", "factory-column:in_progress"],
  );
});

test("planTaskColumnWrite chooses project mode when configured", () => {
  const config = defaultGithubConfig({
    owner: "gaboesquivel",
    repo: "flow-factory",
    ownerType: "user",
    projectNumber: 3,
  });
  const plan = planTaskColumnWrite({
    config,
    taskId: "gaboesquivel/flow-factory#4",
    column: "ready",
  });
  assert.equal(plan.ok, true);
  if (plan.ok) {
    assert.equal(plan.mode, "project");
    assert.equal(plan.statusName, "Ready");
  }
});

test("planTaskColumnWrite falls back to label without project", () => {
  const config = defaultGithubConfig({
    owner: "gaboesquivel",
    repo: "flow-factory",
    ownerType: "user",
  });
  const plan = planTaskColumnWrite({
    config,
    taskId: "gaboesquivel/flow-factory#4",
    column: "ready",
  });
  assert.equal(plan.ok, true);
  if (plan.ok) assert.equal(plan.mode, "label");
});
