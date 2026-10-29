/**
 * Run records for spec 004 (baseline run metrics): pure functions over
 * `eve traces show --json` output and GitHub API payloads. The CLI wrappers in
 * `scripts/runs-record.ts` and `scripts/runs-summary.ts` do the I/O.
 */

export type Station =
  | "classifier"
  | "analyst"
  | "implementer"
  | "reviewer"
  | "orchestrator";

export interface StationUsage {
  durationMs: number;
  gatewayCostUsd: number | null;
  inputTokens: number;
  model: string;
  outputTokens: number;
  station: string;
}

export interface RunRecord {
  failedStation?: Station;
  intervention: boolean;
  issue: { repo: string; number: number; url: string };
  outcome: "reviewed_draft_pr" | "needs_clarification" | "failed";
  pullRequest: { number: number; url: string } | null;
  revisionRounds: number;
  sandboxCostUsd: number | null;
  stations: StationUsage[];
  timestamps: {
    labeledAt: string;
    draftPrOpenedAt?: string;
    reviewPostedAt?: string;
    mergedAt?: string;
    deployedAt?: string;
  };
  traceId: string;
}

interface TraceSpan {
  attributes: Record<string, unknown>;
  durationMs: number;
  name: string;
  parentSpanId: string | null;
}

export interface Trace {
  agentName: string;
  durationMs: number;
  spans: TraceSpan[];
  traceId: string;
}

const ROOT_AGENT = "flow-factory";

const numberAttr = (span: TraceSpan, key: string): number | undefined => {
  const value = span.attributes[key];
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : undefined;
};

const stringAttr = (span: TraceSpan, key: string): string | undefined => {
  const value = span.attributes[key];
  return typeof value === "string" ? value : undefined;
};

// Each subagent activation is its own trace, labeled by `agent.subagent.name`
// on its root span; the top-level agent is the orchestrator.
const traceStation = (trace: Trace): string => {
  const root = trace.spans.find((span) => span.parentSpanId === null);
  const name =
    (root && stringAttr(root, "agent.subagent.name")) ?? trace.agentName;
  return name === ROOT_AGENT ? "orchestrator" : name;
};

/**
 * Per-station usage across a run's traces. Tokens and cost sum `agent.step`
 * spans only, as `eve traces show` does, so model and delegated-call spans are
 * not counted twice. Cost stays `null` when no step reported one.
 */
export const stationsFromTraces = (traces: Trace[]): StationUsage[] => {
  const byStation = new Map<string, StationUsage & { models: Set<string> }>();
  for (const trace of traces) {
    const station = traceStation(trace);
    const entry = byStation.get(station) ?? {
      durationMs: 0,
      gatewayCostUsd: null,
      inputTokens: 0,
      model: "",
      models: new Set<string>(),
      outputTokens: 0,
      station,
    };
    entry.durationMs += trace.durationMs;
    for (const span of trace.spans) {
      if (span.name !== "agent.step") {
        continue;
      }
      const model = stringAttr(span, "agent.model.id");
      if (model) {
        entry.models.add(model);
      }
      entry.inputTokens += numberAttr(span, "agent.usage.input_tokens") ?? 0;
      entry.outputTokens += numberAttr(span, "agent.usage.output_tokens") ?? 0;
      const cost =
        numberAttr(span, "gen_ai.usage.gateway_cost") ??
        numberAttr(span, "gen_ai.usage.cost");
      if (cost !== undefined) {
        entry.gatewayCostUsd = (entry.gatewayCostUsd ?? 0) + cost;
      }
    }
    byStation.set(station, entry);
  }
  return [...byStation.values()].map(({ models, ...usage }) => ({
    ...usage,
    model: [...models].sort().join(","),
  }));
};

/** Reviewer → implementer loops: implementer activations after the first. */
export const revisionRoundsFromTraces = (traces: Trace[]): number =>
  Math.max(
    0,
    traces.filter((trace) => traceStation(trace) === "implementer").length - 1
  );

export interface GitHubInputs {
  deployedAt?: string;
  issue: { number: number; html_url: string };
  label: string;
  repo: string;
  /** Reviews and comments on the linked pull request, when there is one. */
  reviewTimes?: string[];
  /** Issue timeline events, oldest first. */
  timeline: Array<{
    event: string;
    created_at?: string;
    label?: { name: string };
    source?: {
      issue?: {
        number: number;
        html_url: string;
        created_at: string;
        pull_request?: { merged_at?: string | null };
      };
    };
  }>;
}

const earliest = (times: Array<string | undefined>) =>
  times.filter((t): t is string => Boolean(t)).sort()[0];

export interface RecordOverrides {
  failedStation?: Station;
  intervention?: boolean;
  outcome?: RunRecord["outcome"];
  sandboxCostUsd?: number | null;
}

/** Builds a run record from GitHub payloads and the run's traces. */
export const buildRecord = (
  github: GitHubInputs,
  traces: Trace[],
  traceId: string,
  overrides: RecordOverrides = {}
): RunRecord => {
  const labeledAt = github.timeline.find(
    (event) => event.event === "labeled" && event.label?.name === github.label
  )?.created_at;
  if (!labeledAt) {
    throw new Error(
      `Issue #${github.issue.number} has no "${github.label}" labeled event.`
    );
  }
  const pr = github.timeline
    .map((event) => event.source?.issue)
    .find((source) => source?.pull_request && source.created_at >= labeledAt);
  const reviewPostedAt = earliest(github.reviewTimes ?? []);
  const outcome =
    overrides.outcome ??
    (pr && reviewPostedAt ? "reviewed_draft_pr" : "failed");
  const record: RunRecord = {
    intervention: overrides.intervention ?? false,
    issue: {
      number: github.issue.number,
      repo: github.repo,
      url: github.issue.html_url,
    },
    outcome,
    pullRequest: pr ? { number: pr.number, url: pr.html_url } : null,
    revisionRounds: revisionRoundsFromTraces(traces),
    sandboxCostUsd: overrides.sandboxCostUsd ?? null,
    stations: stationsFromTraces(traces),
    timestamps: {
      deployedAt: github.deployedAt,
      draftPrOpenedAt: pr?.created_at,
      labeledAt,
      mergedAt: pr?.pull_request?.merged_at ?? undefined,
      reviewPostedAt,
    },
    traceId,
  };
  if (outcome === "failed" && overrides.failedStation) {
    record.failedStation = overrides.failedStation;
  }
  return record;
};

/**
 * Re-recording fills timestamps and values that were missing and never
 * overwrites what an earlier record already held.
 */
export const mergeRecord = (
  existing: RunRecord,
  fresh: RunRecord
): RunRecord => ({
  ...existing,
  pullRequest: existing.pullRequest ?? fresh.pullRequest,
  sandboxCostUsd: existing.sandboxCostUsd ?? fresh.sandboxCostUsd,
  stations: existing.stations.length > 0 ? existing.stations : fresh.stations,
  timestamps: { ...fresh.timestamps, ...definedOnly(existing.timestamps) },
});

const definedOnly = <T extends object>(value: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined)
  ) as Partial<T>;

/** `docs/runs/<date>-<repo>-<issue>` without an extension. */
export const recordBasename = (record: RunRecord): string => {
  const date = record.timestamps.labeledAt.slice(0, 10);
  const repo = record.issue.repo.split("/")[1] ?? record.issue.repo;
  return `${date}-${repo}-${record.issue.number}`;
};
