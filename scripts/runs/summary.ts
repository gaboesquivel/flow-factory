import type { RunRecord } from "./record.js";

export type Verdict = "useful" | "wrong" | "missed";

export interface RunSummary {
  failures: Array<{
    issue: string;
    outcome: string;
    failedStation: string | null;
  }>;
  findings: Record<Verdict, number>;
  labelToProductionMs: { median: number | null; known: number };
  labelToReviewedPrMs: { median: number | null; p90: number | null };
  runs: number;
  spendPerPullRequestUsd: {
    median: number | null;
    knownRuns: number;
    unknown: Array<{ issue: string; missing: string[] }>;
  };
  stationMedianDurationMs: Record<string, number>;
  unattendedSuccesses: number;
}

const VERDICT_LINES = /^\s*[-*]\s*\[?(useful|wrong|missed)\]?\b/gim;

/** Counts reviewer-finding verdicts in an owner's review note. */
export const countVerdicts = (note: string): Record<Verdict, number> => {
  const counts: Record<Verdict, number> = { missed: 0, useful: 0, wrong: 0 };
  for (const [, verdict = ""] of note.matchAll(VERDICT_LINES)) {
    counts[verdict.toLowerCase() as Verdict] += 1;
  }
  return counts;
};

const percentile = (values: number[], p: number): number | null => {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const rank = (p / 100) * (sorted.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  const lowValue = sorted[low] ?? 0;
  const highValue = sorted[high] ?? lowValue;
  return lowValue + (highValue - lowValue) * (rank - low);
};

const between = (from: string, to: string | undefined) =>
  to === undefined ? undefined : Date.parse(to) - Date.parse(from);

const isUnattendedSuccess = (record: RunRecord) =>
  record.outcome === "reviewed_draft_pr" && !record.intervention;

/**
 * Summarizes run records against the product metrics. Unknown costs are
 * named, never counted as zero: a run with any unknown cost is excluded from
 * the spend median and listed under `unknown`.
 */
export const summarize = (
  records: RunRecord[],
  notes: string[] = []
): RunSummary => {
  const reviewed = records
    .map((r) => between(r.timestamps.labeledAt, r.timestamps.reviewPostedAt))
    .filter((ms): ms is number => ms !== undefined);
  const production = records
    .map((r) => between(r.timestamps.labeledAt, r.timestamps.deployedAt))
    .filter((ms): ms is number => ms !== undefined);

  const durations = new Map<string, number[]>();
  for (const record of records) {
    for (const station of record.stations) {
      durations.set(station.station, [
        ...(durations.get(station.station) ?? []),
        station.durationMs,
      ]);
    }
  }

  const spend: number[] = [];
  const unknown: RunSummary["spendPerPullRequestUsd"]["unknown"] = [];
  for (const record of records.filter((r) => r.pullRequest)) {
    const missing = record.stations
      .filter((s) => s.gatewayCostUsd === null)
      .map((s) => `gateway:${s.station}`);
    if (record.sandboxCostUsd === null) {
      missing.push("sandbox");
    }
    if (missing.length > 0) {
      unknown.push({ issue: record.issue.url, missing });
      continue;
    }
    spend.push(
      record.stations.reduce((sum, s) => sum + (s.gatewayCostUsd ?? 0), 0) +
        (record.sandboxCostUsd ?? 0)
    );
  }

  const findings: Record<Verdict, number> = { missed: 0, useful: 0, wrong: 0 };
  for (const note of notes) {
    const counts = countVerdicts(note);
    findings.useful += counts.useful;
    findings.wrong += counts.wrong;
    findings.missed += counts.missed;
  }

  return {
    failures: records
      .filter((r) => r.outcome !== "reviewed_draft_pr")
      .map((r) => ({
        failedStation: r.failedStation ?? null,
        issue: r.issue.url,
        outcome: r.outcome,
      })),
    findings,
    labelToProductionMs: {
      known: production.length,
      median: percentile(production, 50),
    },
    labelToReviewedPrMs: {
      median: percentile(reviewed, 50),
      p90: percentile(reviewed, 90),
    },
    runs: records.length,
    spendPerPullRequestUsd: {
      knownRuns: spend.length,
      median: percentile(spend, 50),
      unknown,
    },
    stationMedianDurationMs: Object.fromEntries(
      [...durations].map(([station, values]) => [
        station,
        percentile(values, 50) ?? 0,
      ])
    ),
    unattendedSuccesses: records.filter(isUnattendedSuccess).length,
  };
};

const minutes = (ms: number | null) =>
  ms === null ? "unknown" : `${(ms / 60_000).toFixed(1)} min`;

const usd = (value: number | null) =>
  value === null ? "unknown" : `$${value.toFixed(4)}`;

/** Human-readable form of {@link summarize}'s result. */
export const formatSummary = (summary: RunSummary): string => {
  const lines = [
    `Unattended success: ${summary.unattendedSuccesses} of ${summary.runs}`,
    `Label → reviewed draft PR: median ${minutes(summary.labelToReviewedPrMs.median)}, p90 ${minutes(summary.labelToReviewedPrMs.p90)}`,
    `Label → production: median ${minutes(summary.labelToProductionMs.median)} (${summary.labelToProductionMs.known} known)`,
    "Per-station median duration:",
    ...Object.entries(summary.stationMedianDurationMs).map(
      ([station, ms]) => `  ${station}: ${minutes(ms)}`
    ),
    `Spend per pull request: median ${usd(summary.spendPerPullRequestUsd.median)} over ${summary.spendPerPullRequestUsd.knownRuns} runs with known cost`,
    ...summary.spendPerPullRequestUsd.unknown.map(
      (u) => `  unknown: ${u.issue} (${u.missing.join(", ")})`
    ),
    `Review findings: ${summary.findings.useful} useful, ${summary.findings.wrong} wrong, ${summary.findings.missed} missed`,
  ];
  for (const failure of summary.failures) {
    lines.push(
      `Not reviewed: ${failure.issue} (${failure.outcome}${failure.failedStation ? ` at ${failure.failedStation}` : ""})`
    );
  }
  return lines.join("\n");
};
