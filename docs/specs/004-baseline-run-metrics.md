# Spec 004 — Baseline run metrics

**Status:** accepted (2026-10-28) · **Issue:** [#17](https://github.com/gaboesquivel/flow-factory/issues/17)  
**Builds on:** [003 — Eve / Foreman rewrite](003-eve-foreman-rewrite.md) (completes its open live draft-PR criterion)  
**Product context:** [PRODUCT.md — Speed on a small budget, Metrics](../../PRODUCT.md#metrics)

## Problem Statement

The owner wants the factory to deliver reviewed draft pull requests faster and on a small budget, using parallel runs, leaner sessions, local models, and subscription CLIs. None of that can be judged today. Nobody has run the factory from a labeled issue to a reviewed draft pull request on a live repository (spec 003's last open criterion), and nothing records how long a run takes, which station spends the time, what it costs, or whether the review found real problems. Without a baseline, every later bet is a guess.

## Solution

Run the current factory, unchanged, on five real issues labeled at the same time, and record each run. One command turns a finished run into a run record; another summarizes all records against the product metrics.

The bet tests one assumption: **the current factory delivers reviewed draft pull requests unattended, reliably enough that speed is the next constraint.** If fewer than 4 of 5 labeled issues reach a reviewed draft pull request with no intervention, reliability is the next bet, not speed.

## User Stories

1. As the owner, I label five issues at once and walk away, so I come back to five reviewed draft pull requests or to clear failures that say which station stopped and why.
2. As the owner, I run one command per finished run, so I get a record with elapsed time per station, total time from label to reviewed draft pull request, tokens, and cost.
3. As the owner, I mark each reviewer finding as useful, wrong, or missed, so review quality has a baseline beside speed and spend.
4. As the owner, I run one summary command, so I see median time, unattended success rate, and spend per pull request, with any unknown cost marked unknown rather than zero.
5. As an agent session, I file and label an issue through GitHub and later read the summary as JSON, so I can hand work to the factory and see how it went without a person relaying it.

## Implementation Decisions

**Exposure:** Local only. The record and summary commands run on the owner's machine with the owner's `gh` login and read-only GitHub API calls. They write files only under `docs/runs/` in this repository. Nothing is added to the deployed agent, no route or tool is exposed, and no runtime behavior changes. The baseline runs themselves use the existing GitHub channel, label dispatch, and `gateway` model profile.

**What runs.** The factory as it is on `main`: Vercel Sandboxes, `FACTORY_MODEL_PROFILE=gateway`, the station models in `agent/lib/model-policy.ts`. Runs execute under `eve dev` so traces land locally in `.eve/traces/v1`. Changing models, sandboxes, or executors is out of scope; the point is the baseline.

**Run record contract.** One JSON file per run at `docs/runs/<date>-<repo>-<issue>.json`, plus a short Markdown note beside it for review judgments. Shape:

```ts
type RunRecord = {
  issue: { repo: string; number: number; url: string };
  pullRequest: { number: number; url: string } | null;
  outcome: "reviewed_draft_pr" | "needs_clarification" | "failed";
  failedStation?: "classifier" | "analyst" | "implementer" | "reviewer" | "orchestrator";
  intervention: boolean; // any human action between label and reviewed draft PR
  timestamps: {
    labeledAt: string;          // GitHub issue timeline "labeled" event
    draftPrOpenedAt?: string;   // GitHub pull request created_at
    reviewPostedAt?: string;    // reviewer's review or comment on the PR
    mergedAt?: string;          // filled later; human merge
    deployedAt?: string;        // filled later; first successful deployment of the merge commit
  };
  stations: Array<{
    station: string;
    model: string;              // model id that actually ran
    durationMs: number;
    inputTokens: number;
    outputTokens: number;
    gatewayCostUsd: number | null;
  }>;
  revisionRounds: number;       // reviewer → implementer loops
  sandboxCostUsd: number | null; // null = unknown; never 0 by default
  traceId: string;
};
```

**Sources.** GitHub timestamps are the source of truth for elapsed time. Per-station duration, model, tokens, and Gateway cost come from `eve traces show <trace> --json` (step spans carry `agent.usage.*` and Gateway cost; sum step spans only, as the CLI does). Sandbox cost comes from the Vercel usage view when available and is otherwise `null`. A missing value is `null`, reported as unknown.

**Commands.** `pnpm runs:record <issue-url> [--trace <id>]` writes or updates one record; re-running it fills later timestamps (merge, deploy) without changing earlier fields. `pnpm runs:summary [--json]` prints, over all records: unattended success count, median and p90 time from label to reviewed draft PR, median time from label to production where known, per-station median duration, spend per pull request (Gateway plus sandbox, with unknowns counted and named), and review findings by verdict. `--json` is the agent interface; the same fields, stable names.

**Review judgments.** The Markdown note lists each reviewer finding with `useful`, `wrong`, or `missed` and one line of evidence. The owner writes it; the summary counts it. This is the quality guardrail's baseline.

**Issues.** Five small, real issues on the target repository, chosen by the owner, labeled within one minute of each other so the baseline also shows how parallel runs behave today. Mix: at least one bug fix, one small feature, and one docs or config change.

## Testing Decisions

The record and summary logic are pure functions over fixture inputs (a trace JSON and GitHub API payloads), tested with `node --test` beside the existing tests in `tests/`. Tests cover: summing step spans only; `null` cost staying unknown in the summary; a failed run counted as a failure with its station; re-recording a run filling merge and deploy timestamps without overwriting earlier fields. `pnpm validate` and `pnpm test` pass. These are structural checks; the live runs are the evidence.

**Acceptance scenario.** Actor: the owner on their Mac. Starting state: `main` with this spec's commands, `FACTORY_REPO` and `GITHUB_CONNECTOR` set, `eve link` done, `FACTORY_MODEL_PROFILE=gateway`, `eve dev` running, and five small real issues open on the target repository.

1. Label all five issues with the factory label within one minute. Result: five unattended sessions start; no prompt waits for the owner.
2. Wait without intervening. Result: each issue ends in a reviewed draft pull request, or the issue or session shows which station stopped and why. No pull request is merged or marked ready by the factory.
3. Run `pnpm runs:record <issue-url>` for each issue. Result: five files under `docs/runs/` matching the record contract, with model ids that match the traces and any unavailable cost as `null`.
4. Write the review note for each pull request. Result: every reviewer finding has a verdict, and any problem the owner found that the reviewer did not is listed as `missed`.
5. Run `pnpm runs:summary`. Result: unattended success count out of 5, median and p90 label-to-reviewed-PR time, per-station medians, spend per pull request with unknowns named, and finding verdict counts. `pnpm runs:summary --json` prints the same values.
6. Result for spec 003: its "Live labeled issue → draft PR" criterion is checked, linking the run records.

Agent journey: an agent session files and labels the same kind of issue with `gh issue create --label <factory label>` and later reads `pnpm runs:summary --json`. No MCP tool is added in this bet; GitHub issues are the agent interface.

**Decision rule.** 4 or more of 5 reach a reviewed draft pull request unattended: the next bet is speed (lean sessions and parallel concurrency). Fewer: the next bet is the failure the records point to.

## Out of Scope

- Changing models, model profiles, sandbox backends, or executors.
- Lean sessions, warm snapshots, concurrency limits, or any speed change.
- Local models, microsandbox, Claude Code or Cursor executors.
- A dashboard, hosted metrics store, or runtime instrumentation in the deployed agent.
- Autonomous merge.

## Further Notes

- Later bets, not specified yet, in expected order: lean sessions and parallel concurrency; local first-pass review on a ~9B model using the Flow Skills review contract; local code execution on microsandbox selected by environment; a subscription CLI implementer (Claude Code or Cursor's own models). Each is judged against this baseline.
- Research during exploration (2026-10-28): Claude Code headless on a Pro/Max login draws from subscription limits but Anthropic describes subscription logins as for ordinary use; Cursor bills Claude, GPT, and Gemini from prepaid credit at API price; only microsandbox among Eve's local backends supports the credential transforms the clone and push rely on; a ~9B local model on 16 GB is a first-pass reviewer, not the gate.
- Today's Gateway station models are low-cost (DeepSeek V4, GLM). If spend per pull request is already trivial, later bets optimize speed and quality, not cost.
