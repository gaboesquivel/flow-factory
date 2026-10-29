import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import {
  buildRecord,
  type GitHubInputs,
  mergeRecord,
  type RecordOverrides,
  type RunRecord,
  recordBasename,
  type Station,
  type Trace,
} from "./runs/record.js";

const RUNS_DIR = "docs/runs";
const ISSUE_URL = /github\.com\/([^/]+\/[^/]+)\/issues\/(\d+)/;
const JSON_EXTENSION = /\.json$/;
const REVIEW_COMMENT = /\breview(er)?\b/i;

const gh = <T>(path: string): T =>
  JSON.parse(
    execFileSync("gh", ["api", "--paginate", "--slurp", path], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    })
  ).flat() as T;

const ghOne = <T>(path: string): T =>
  JSON.parse(execFileSync("gh", ["api", path], { encoding: "utf8" })) as T;

const readTraces = (id: string): Trace[] =>
  JSON.parse(
    execFileSync("pnpm", ["exec", "eve", "traces", "show", id, "--json"], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    })
  ) as Trace[];

const reviewTimes = (repo: string, pr: number): string[] => {
  const reviews = gh<Array<{ submitted_at?: string }>>(
    `repos/${repo}/pulls/${pr}/reviews`
  ).map((review) => review.submitted_at);
  const comments = gh<Array<{ created_at: string; body?: string }>>(
    `repos/${repo}/issues/${pr}/comments`
  )
    .filter((comment) => REVIEW_COMMENT.test(comment.body ?? ""))
    .map((comment) => comment.created_at);
  return [...reviews, ...comments].filter((t): t is string => Boolean(t));
};

const deployedAt = (repo: string, pr: number): string | undefined => {
  const { merge_commit_sha: sha, merged_at: mergedAt } = ghOne<{
    merge_commit_sha: string | null;
    merged_at: string | null;
  }>(`repos/${repo}/pulls/${pr}`);
  if (!(sha && mergedAt)) {
    return;
  }
  const times: string[] = [];
  for (const deployment of gh<Array<{ id: number }>>(
    `repos/${repo}/deployments?sha=${sha}`
  )) {
    for (const status of gh<Array<{ state: string; created_at: string }>>(
      `repos/${repo}/deployments/${deployment.id}/statuses`
    )) {
      if (status.state === "success") {
        times.push(status.created_at);
      }
    }
  }
  return times.sort()[0];
};

const main = () => {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      "failed-station": { type: "string" },
      intervention: { type: "boolean" },
      outcome: { type: "string" },
      "sandbox-cost": { type: "string" },
      trace: { type: "string" },
    },
  });
  const match = positionals[0]?.match(ISSUE_URL);
  if (!match) {
    console.error(
      "Usage: pnpm runs:record <issue-url> [--trace <id>] [--outcome reviewed_draft_pr|needs_clarification|failed] [--failed-station <station>] [--intervention] [--sandbox-cost <usd>]"
    );
    process.exit(1);
  }
  const [, repo = "", issueNumber] = match;
  const number = Number(issueNumber);

  const issue = ghOne<GitHubInputs["issue"]>(`repos/${repo}/issues/${number}`);
  const timeline = gh<GitHubInputs["timeline"]>(
    `repos/${repo}/issues/${number}/timeline`
  );
  const prNumber = timeline.find((e) => e.source?.issue?.pull_request)?.source
    ?.issue?.number;
  const github: GitHubInputs = {
    deployedAt: prNumber ? deployedAt(repo, prNumber) : undefined,
    issue,
    label: process.env.FACTORY_LABEL ?? "factory",
    repo,
    reviewTimes: prNumber ? reviewTimes(repo, prNumber) : [],
    timeline,
  };

  mkdirSync(RUNS_DIR, { recursive: true });
  const existingPath = findExisting(repo, number);
  const existing = existingPath
    ? (JSON.parse(readFileSync(existingPath, "utf8")) as RunRecord)
    : undefined;
  const traceId = values.trace ?? existing?.traceId;
  if (!traceId) {
    console.error(
      "First record of a run needs --trace <trace or conversation id>."
    );
    process.exit(1);
  }

  const overrides: RecordOverrides = {
    failedStation: values["failed-station"] as Station | undefined,
    intervention: values.intervention,
    outcome: values.outcome as RunRecord["outcome"] | undefined,
    sandboxCostUsd:
      values["sandbox-cost"] === undefined
        ? undefined
        : Number(values["sandbox-cost"]),
  };
  const fresh = buildRecord(github, readTraces(traceId), traceId, overrides);
  const record = existing ? mergeRecord(existing, fresh) : fresh;
  const path = existingPath ?? join(RUNS_DIR, `${recordBasename(record)}.json`);
  writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`);

  const notePath = path.replace(JSON_EXTENSION, ".md");
  if (!existsSync(notePath)) {
    writeFileSync(
      notePath,
      `# Review note: ${record.issue.url}\n\nOne line per reviewer finding: \`- useful|wrong|missed: <finding> — <evidence>\`. List problems the reviewer did not find as \`missed\`.\n\n`
    );
  }
  console.log(`Recorded ${path}`);
};

const findExisting = (repo: string, number: number): string | undefined => {
  const suffix = `-${repo.split("/")[1]}-${number}.json`;
  const match = readdirSync(RUNS_DIR).find((name) => name.endsWith(suffix));
  return match ? join(RUNS_DIR, match) : undefined;
};

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
