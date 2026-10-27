import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { openDatabase } from "../src/db.ts";
import { createStore } from "../src/store.ts";

test("start_run is idempotent for the same key", () => {
  const dir = mkdtempSync(join(tmpdir(), "factory-"));
  const db = openDatabase(join(dir, "test.db"));
  const store = createStore(db);
  store.upsertTask({
    id: "gaboesquivel/flow-factory#1",
    title: "Test",
    body: "",
    column: "ready",
    blocked: false,
    priority: null,
    assignee: null,
    activeSpecialist: null,
    acceptanceCriteria: [],
    runId: null,
    runStatus: null,
    syncError: null,
  });

  const first = store.startRun({
    taskId: "gaboesquivel/flow-factory#1",
    specialist: "dev",
    adapter: "cursor",
    model: null,
    idempotencyKey: "run-1",
  });
  const second = store.startRun({
    taskId: "gaboesquivel/flow-factory#1",
    specialist: "dev",
    adapter: "cursor",
    model: null,
    idempotencyKey: "run-1",
  });

  assert.equal(first.run.id, second.run.id);
});

test("concurrent claims allow one holder", () => {
  const dir = mkdtempSync(join(tmpdir(), "factory-"));
  const db = openDatabase(join(dir, "test.db"));
  const store = createStore(db);
  store.upsertTask({
    id: "gaboesquivel/flow-factory#2",
    title: "Claim",
    body: "",
    column: "ready",
    blocked: false,
    priority: null,
    assignee: null,
    activeSpecialist: null,
    acceptanceCriteria: [],
    runId: null,
    runStatus: null,
    syncError: null,
  });

  const a = store.claimTask({ taskId: "gaboesquivel/flow-factory#2", holder: "alice" });
  const b = store.claimTask({ taskId: "gaboesquivel/flow-factory#2", holder: "bob" });
  assert.equal(a.ok, true);
  assert.equal(b.ok, false);
  if (!b.ok) assert.equal(b.error, "already_claimed");
});
