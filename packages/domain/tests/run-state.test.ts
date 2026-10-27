import assert from "node:assert/strict";
import test from "node:test";

import { canTransitionRun, formatTaskId, parseTaskId } from "../src/index.ts";

test("format and parse task id", () => {
  const ref = { owner: "gaboesquivel", repo: "flow-factory", number: 12 };
  assert.equal(formatTaskId(ref), "gaboesquivel/flow-factory#12");
  assert.deepEqual(parseTaskId("gaboesquivel/flow-factory#12"), ref);
});

test("cancelled run cannot complete", () => {
  assert.equal(canTransitionRun({ from: "cancelled", to: "completed" }), false);
  assert.equal(canTransitionRun({ from: "running", to: "completed" }), true);
});
