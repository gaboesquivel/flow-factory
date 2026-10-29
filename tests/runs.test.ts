import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildRecord,
  type GitHubInputs,
  mergeRecord,
  stationsFromTraces,
  type Trace,
} from "../scripts/runs/record.js";
import { countVerdicts, summarize } from "../scripts/runs/summary.js";

const step = (model: string, input: number, output: number, cost?: number) => ({
  attributes: {
    "agent.model.id": model,
    "agent.usage.input_tokens": input,
    "agent.usage.output_tokens": output,
    ...(cost === undefined ? {} : { "gen_ai.usage.gateway_cost": cost }),
  },
  durationMs: 100,
  name: "agent.step",
  parentSpanId: "root",
});

const trace = (
  station: string | null,
  durationMs: number,
  spans: Trace["spans"]
): Trace => ({
  agentName: "flow-factory",
  durationMs,
  spans: [
    {
      attributes: {
        // Root spans carry the turn's totals too; they must not be summed.
        "agent.usage.input_tokens": 999_999,
        ...(station ? { "agent.subagent.name": station } : {}),
      },
      durationMs,
      name: "invoke_agent",
      parentSpanId: null,
    },
    ...spans,
  ],
  traceId: `t-${station}`,
});

const traces: Trace[] = [
  trace(null, 1000, [step("deepseek/flash", 10, 1, 0.001)]),
  trace("implementer", 5000, [
    step("deepseek/pro", 100, 50, 0.01),
    {
      attributes: { "agent.usage.input_tokens": 100 },
      durationMs: 90,
      name: "chat deepseek/pro",
      parentSpanId: "root",
    },
  ]),
  trace("reviewer", 2000, [step("zai/glm", 40, 5)]),
  trace("implementer", 3000, [step("deepseek/pro", 20, 10, 0.002)]),
];

const github: GitHubInputs = {
  issue: { html_url: "https://github.com/acme/widgets/issues/7", number: 7 },
  label: "factory",
  repo: "acme/widgets",
  reviewTimes: ["2026-11-01T10:30:00Z"],
  timeline: [
    {
      created_at: "2026-11-01T10:00:00Z",
      event: "labeled",
      label: { name: "factory" },
    },
    {
      event: "cross-referenced",
      source: {
        issue: {
          created_at: "2026-11-01T10:20:00Z",
          html_url: "https://github.com/acme/widgets/pull/8",
          number: 8,
          pull_request: { merged_at: null },
        },
      },
    },
  ],
};

test("stations sum step spans only and keep the models that ran", () => {
  const stations = stationsFromTraces(traces);
  const implementer = stations.find((s) => s.station === "implementer");
  assert.deepEqual(implementer, {
    durationMs: 8000,
    gatewayCostUsd: 0.012,
    inputTokens: 120,
    model: "deepseek/pro",
    outputTokens: 60,
    station: "implementer",
  });
  assert.equal(
    stations.find((s) => s.station === "orchestrator")?.inputTokens,
    10
  );
});

test("a station with no reported cost stays unknown", () => {
  const reviewer = stationsFromTraces(traces).find(
    (s) => s.station === "reviewer"
  );
  assert.equal(reviewer?.gatewayCostUsd, null);
});

test("a reviewed draft PR records timestamps and revision rounds", () => {
  const record = buildRecord(github, traces, "conv-1");
  assert.equal(record.outcome, "reviewed_draft_pr");
  assert.deepEqual(record.pullRequest, {
    number: 8,
    url: "https://github.com/acme/widgets/pull/8",
  });
  assert.equal(record.timestamps.draftPrOpenedAt, "2026-11-01T10:20:00Z");
  assert.equal(record.revisionRounds, 1);
  assert.equal(record.sandboxCostUsd, null);
});

test("a failed run is counted as a failure with its station", () => {
  const record = buildRecord(
    { ...github, reviewTimes: [], timeline: github.timeline.slice(0, 1) },
    traces,
    "conv-2",
    { failedStation: "implementer" }
  );
  assert.equal(record.outcome, "failed");
  assert.equal(record.failedStation, "implementer");
  const summary = summarize([record]);
  assert.equal(summary.unattendedSuccesses, 0);
  assert.deepEqual(summary.failures, [
    {
      failedStation: "implementer",
      issue: github.issue.html_url,
      outcome: "failed",
    },
  ]);
});

test("re-recording fills merge and deploy without overwriting earlier fields", () => {
  const first = buildRecord(github, traces, "conv-1", { intervention: false });
  const later = buildRecord(
    {
      ...github,
      deployedAt: "2026-11-02T09:05:00Z",
      reviewTimes: ["2026-11-01T11:45:00Z"],
      timeline: [
        {
          created_at: "2026-11-01T10:00:00Z",
          event: "labeled",
          label: { name: "factory" },
        },
        {
          event: "cross-referenced",
          source: {
            issue: {
              created_at: "2026-11-01T10:20:00Z",
              html_url: "https://github.com/acme/widgets/pull/8",
              number: 8,
              pull_request: { merged_at: "2026-11-02T09:00:00Z" },
            },
          },
        },
      ],
    },
    [],
    "conv-1"
  );
  const merged = mergeRecord(first, later);
  assert.equal(merged.timestamps.reviewPostedAt, "2026-11-01T10:30:00Z");
  assert.equal(merged.timestamps.mergedAt, "2026-11-02T09:00:00Z");
  assert.equal(merged.timestamps.deployedAt, "2026-11-02T09:05:00Z");
  assert.deepEqual(merged.stations, first.stations);
});

test("summary names unknown cost instead of counting it as zero", () => {
  const known = buildRecord(github, traces.slice(0, 2), "a", {
    sandboxCostUsd: 0.05,
  });
  const unknown = buildRecord(github, traces, "b");
  const summary = summarize([known, unknown]);
  assert.equal(summary.unattendedSuccesses, 2);
  assert.equal(summary.spendPerPullRequestUsd.knownRuns, 1);
  assert.ok(
    Math.abs((summary.spendPerPullRequestUsd.median ?? 0) - 0.061) < 1e-9
  );
  assert.deepEqual(summary.spendPerPullRequestUsd.unknown[0]?.missing, [
    "gateway:reviewer",
    "sandbox",
  ]);
  assert.equal(summary.labelToReviewedPrMs.median, 30 * 60_000);
  assert.equal(summary.labelToProductionMs.median, null);
});

test("review notes count verdicts", () => {
  assert.deepEqual(
    countVerdicts(
      "# Note\n\n- useful: null check — crash on empty\n- wrong: style nit\n- missed: no test\n- useful: race\n"
    ),
    { missed: 1, useful: 2, wrong: 1 }
  );
});
