import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import type { RunRecord } from "./runs/record.js";
import { formatSummary, summarize } from "./runs/summary.js";

const RUNS_DIR = "docs/runs";

const { values } = parseArgs({ options: { json: { type: "boolean" } } });

const files = existsSync(RUNS_DIR) ? readdirSync(RUNS_DIR).sort() : [];
const read = (name: string) => readFileSync(join(RUNS_DIR, name), "utf8");
const records = files
  .filter((name) => name.endsWith(".json"))
  .map((name) => JSON.parse(read(name)) as RunRecord);
const notes = files.filter((name) => name.endsWith(".md")).map(read);

const summary = summarize(records, notes);
console.log(
  values.json ? JSON.stringify(summary, null, 2) : formatSummary(summary)
);
