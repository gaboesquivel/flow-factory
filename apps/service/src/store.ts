import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

import {
  type FactoryStatus,
  type HandoffRecord,
  type KanbanColumn,
  type RunRecord,
  type RunStatus,
  type SpecialistRole,
  type TaskRecord,
  canTransitionRun,
} from "@flow-factory/domain";

import { getMeta, setMeta } from "./db.js";
import { probeCursor, probeOllama } from "./adapters.js";
import { listActivity, logActivity } from "./activity.js";
import { defaultGithubConfig } from "./github/config.js";
import { probeGhAuth } from "./github/gh.js";
import { createAuthorizedDraftPr } from "./github/draft-pr.js";
import { syncGithubIssues } from "./github/sync.js";
import type { GithubConfig } from "./github/types.js";
import { parseTaskId } from "@flow-factory/domain";

const parseJson = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const rowToTask = (row: Record<string, unknown>): TaskRecord => ({
  id: String(row.id),
  title: String(row.title),
  body: String(row.body),
  column: row.column as KanbanColumn,
  blocked: Boolean(row.blocked),
  priority: row.priority ? String(row.priority) : null,
  assignee: row.assignee ? String(row.assignee) : null,
  activeSpecialist: row.active_specialist ? (row.active_specialist as SpecialistRole) : null,
  revision: Number(row.revision),
  acceptanceCriteria: parseJson(String(row.acceptance_criteria), []),
  runId: row.run_id ? String(row.run_id) : null,
  runStatus: row.run_status ? (row.run_status as RunStatus) : null,
  syncError: row.sync_error ? String(row.sync_error) : null,
});

export const createStore = (db: DatabaseSync) => {
  const isPaused = () => getMeta(db, "paused") === "true";

  const setPaused = (paused: boolean) => setMeta(db, "paused", String(paused));

  const getGithubConfig = (): GithubConfig | null => {
    const raw = getMeta(db, "github_config");
    return raw ? (JSON.parse(raw) as GithubConfig) : null;
  };

  const setGithubConfig = (config: GithubConfig) => {
    setMeta(db, "github_config", JSON.stringify(config));
    setMeta(db, "github_repo", `${config.owner}/${config.repo}`);
    setMeta(db, "github_error", "");
  };

  const getFactoryStatus = async (): Promise<FactoryStatus> => {
    const [cursor, ollama, gh] = await Promise.all([probeCursor(), probeOllama(), probeGhAuth()]);
    const githubError = getMeta(db, "github_error");
    const githubRepo = getMeta(db, "github_repo");
    const ghMessage = !gh.ok ? gh.error : githubError;
    return {
      paused: isPaused(),
      github: {
        connected: Boolean(githubRepo) && gh.ok && !githubError,
        error: ghMessage,
      },
      adapters: { cursor, ollama },
    };
  };

  const syncGithub = async () => {
    const config = getGithubConfig();
    if (!config) {
      setMeta(db, "github_error", "github_not_configured");
      return { ok: false as const, error: "github_not_configured" };
    }
    try {
      const result = await syncGithubIssues(config);
      setMeta(db, "github_repo", result.repo);
      setMeta(db, "github_error", result.projectError ?? "");
      for (const incoming of result.tasks) {
        const existing = getTask(incoming.id);
        upsertTask({
          ...incoming,
          revision: existing?.revision ?? 1,
          assignee: existing?.assignee ?? incoming.assignee,
          activeSpecialist: existing?.activeSpecialist ?? null,
          runId: existing?.runId ?? null,
          runStatus: existing?.runStatus ?? null,
        });
      }
      return { ok: true as const, count: result.tasks.length, projectError: result.projectError };
    } catch (error) {
      const message = error instanceof Error ? error.message : "sync_failed";
      setMeta(db, "github_error", message);
      return { ok: false as const, error: message };
    }
  };

  const logTaskActivity = (taskId: string, kind: string, payload: Record<string, unknown>) =>
    logActivity({ db, taskId, kind, payload });

  const listTasks = (): TaskRecord[] => {
    const rows = db.prepare("SELECT * FROM tasks ORDER BY id").all() as Record<string, unknown>[];
    return rows.map(rowToTask);
  };

  const getTask = (id: string) => {
    const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
      | Record<string, unknown>
      | undefined;
    return row ? rowToTask(row) : null;
  };

  const upsertTask = (task: Omit<TaskRecord, "revision"> & { revision?: number }) => {
    const revision = task.revision ?? 1;
    db.prepare(
      `INSERT INTO tasks (
        id, title, body, column, blocked, priority, assignee, active_specialist,
        revision, acceptance_criteria, run_id, run_status, sync_error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        body = excluded.body,
        column = excluded.column,
        blocked = excluded.blocked,
        priority = excluded.priority,
        assignee = excluded.assignee,
        active_specialist = excluded.active_specialist,
        revision = excluded.revision,
        acceptance_criteria = excluded.acceptance_criteria,
        run_id = excluded.run_id,
        run_status = excluded.run_status,
        sync_error = excluded.sync_error`,
    ).run(
      task.id,
      task.title,
      task.body,
      task.column,
      task.blocked ? 1 : 0,
      task.priority,
      task.assignee,
      task.activeSpecialist,
      revision,
      JSON.stringify(task.acceptanceCriteria),
      task.runId,
      task.runStatus,
      task.syncError,
    );
    return getTask(task.id)!;
  };

  const claimTask = ({
    taskId,
    holder,
    expectedRevision,
  }: {
    taskId: string;
    holder: string;
    expectedRevision?: number;
  }) => {
    const task = getTask(taskId);
    if (!task) return { ok: false as const, error: "task_not_found" };
    if (expectedRevision !== undefined && task.revision !== expectedRevision) {
      return { ok: false as const, error: "revision_conflict", task };
    }
    const existing = db.prepare("SELECT holder FROM reservations WHERE task_id = ?").get(taskId) as
      | { holder: string }
      | undefined;
    if (existing && existing.holder !== holder) {
      return { ok: false as const, error: "already_claimed", holder: existing.holder };
    }
    if (!existing) {
      db.prepare("INSERT INTO reservations (task_id, holder, claimed_at) VALUES (?, ?, ?)").run(
        taskId,
        holder,
        new Date().toISOString(),
      );
    }
    const updated = upsertTask({
      ...task,
      assignee: holder,
      revision: task.revision + 1,
    });
    logTaskActivity(taskId, "claimed", { holder });
    return { ok: true as const, task: updated };
  };

  const releaseTask = ({
    taskId,
    holder,
    expectedRevision,
  }: {
    taskId: string;
    holder: string;
    expectedRevision?: number;
  }) => {
    const task = getTask(taskId);
    if (!task) return { ok: false as const, error: "task_not_found" };
    if (expectedRevision !== undefined && task.revision !== expectedRevision) {
      return { ok: false as const, error: "revision_conflict", task };
    }
    const existing = db.prepare("SELECT holder FROM reservations WHERE task_id = ?").get(taskId) as
      | { holder: string }
      | undefined;
    if (existing && existing.holder !== holder) {
      return { ok: false as const, error: "held_by_other", holder: existing.holder };
    }
    db.prepare("DELETE FROM reservations WHERE task_id = ?").run(taskId);
    const updated = upsertTask({
      ...task,
      assignee: null,
      revision: task.revision + 1,
    });
    return { ok: true as const, task: updated };
  };

  const saveHandoff = ({
    taskId,
    summary,
    nextAction,
    context,
    expectedRevision,
  }: {
    taskId: string;
    summary: string;
    nextAction: string;
    context: string;
    expectedRevision?: number;
  }) => {
    const existing = db.prepare("SELECT revision FROM handoffs WHERE task_id = ?").get(taskId) as
      | { revision: number }
      | undefined;
    const revision = (existing?.revision ?? 0) + 1;
    if (expectedRevision !== undefined && revision - 1 !== expectedRevision) {
      return { ok: false as const, error: "revision_conflict" };
    }
    const updatedAt = new Date().toISOString();
    db.prepare(
      `INSERT INTO handoffs (task_id, summary, next_action, context, updated_at, revision)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(task_id) DO UPDATE SET
         summary = excluded.summary,
         next_action = excluded.next_action,
         context = excluded.context,
         updated_at = excluded.updated_at,
         revision = excluded.revision`,
    ).run(taskId, summary, nextAction, context, updatedAt, revision);
    logTaskActivity(taskId, "handoff_saved", { revision });
    return {
      ok: true as const,
      handoff: {
        taskId,
        summary,
        nextAction,
        context,
        updatedAt,
        revision,
      } satisfies HandoffRecord,
    };
  };

  const getHandoff = (taskId: string): HandoffRecord | null => {
    const row = db.prepare("SELECT * FROM handoffs WHERE task_id = ?").get(taskId) as
      | Record<string, unknown>
      | undefined;
    if (!row) return null;
    return {
      taskId: String(row.task_id),
      summary: String(row.summary),
      nextAction: String(row.next_action),
      context: String(row.context),
      updatedAt: String(row.updated_at),
      revision: Number(row.revision),
    };
  };

  const getRun = (id: string): RunRecord | null => {
    const row = db.prepare("SELECT * FROM runs WHERE id = ?").get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row) return null;
    return {
      id: String(row.id),
      taskId: String(row.task_id),
      status: row.status as RunStatus,
      specialist: row.specialist as SpecialistRole,
      adapter: row.adapter as RunRecord["adapter"],
      model: row.model ? String(row.model) : null,
      worktreePath: row.worktree_path ? String(row.worktree_path) : null,
      branchName: row.branch_name ? String(row.branch_name) : null,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      evidence: row.evidence ? String(row.evidence) : null,
      error: row.error ? String(row.error) : null,
    };
  };

  const startRun = ({
    taskId,
    specialist,
    adapter,
    model,
    idempotencyKey,
  }: {
    taskId: string;
    specialist: SpecialistRole;
    adapter: "cursor" | "ollama";
    model: string | null;
    idempotencyKey: string;
  }) => {
    const cached = db
      .prepare("SELECT response_json FROM idempotency WHERE key = ?")
      .get(idempotencyKey) as { response_json: string } | undefined;
    if (cached) return JSON.parse(cached.response_json) as { run: RunRecord };

    if (isPaused()) {
      throw new Error("factory_paused");
    }

    const active = db
      .prepare(
        "SELECT id FROM runs WHERE task_id = ? AND status IN ('queued','preparing','running') LIMIT 1",
      )
      .get(taskId) as { id: string } | undefined;
    if (active) {
      const run = getRun(active.id)!;
      return { run, duplicate: true };
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    const status: RunStatus = "queued";
    db.prepare(
      `INSERT INTO runs (id, task_id, status, specialist, adapter, model, worktree_path, branch_name, created_at, updated_at, evidence, error)
       VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, NULL, NULL)`,
    ).run(id, taskId, status, specialist, adapter, model, now, now);

    const run = getRun(id)!;
    const task = getTask(taskId);
    if (task) {
      upsertTask({
        ...task,
        runId: id,
        runStatus: status,
        revision: task.revision,
      });
    }
    const payload = { run, duplicate: false };
    db.prepare("INSERT INTO idempotency (key, response_json, created_at) VALUES (?, ?, ?)").run(
      idempotencyKey,
      JSON.stringify(payload),
      now,
    );
    logTaskActivity(taskId, "run_started", { runId: id, adapter });
    return payload;
  };

  const takeQueuedRun = () => {
    const row = db
      .prepare("SELECT id FROM runs WHERE status = 'queued' ORDER BY created_at ASC LIMIT 1")
      .get() as { id: string } | undefined;
    if (!row) return null;
    updateRunStatus({ runId: row.id, status: "preparing" });
    return getRun(row.id);
  };

  const updateTask = ({
    taskId,
    column,
    blocked,
    expectedRevision,
  }: {
    taskId: string;
    column?: KanbanColumn;
    blocked?: boolean;
    expectedRevision?: number;
  }) => {
    const task = getTask(taskId);
    if (!task) return { ok: false as const, error: "task_not_found" };
    if (expectedRevision !== undefined && task.revision !== expectedRevision) {
      return { ok: false as const, error: "revision_conflict", task };
    }
    const updated = upsertTask({
      ...task,
      column: column ?? task.column,
      blocked: blocked ?? task.blocked,
      revision: task.revision + 1,
    });
    logTaskActivity(taskId, "task_updated", { column: updated.column });
    return { ok: true as const, task: updated };
  };

  const submitResult = ({
    runId,
    evidence,
    verified,
  }: {
    runId: string;
    evidence: string;
    verified: boolean;
  }) => {
    const run = getRun(runId);
    if (!run) return { ok: false as const, error: "run_not_found" };
    if (run.status === "cancelled") return { ok: false as const, error: "run_cancelled" };
    const status = verified ? "completed" : "awaiting_intervention";
    const updated = updateRunStatus({ runId, status, evidence });
    if (!updated) return { ok: false as const, error: "invalid_transition" };
    logTaskActivity(run.taskId, "result_submitted", { runId, verified });
    return { ok: true as const, run: updated };
  };

  const saveReview = ({
    runId,
    verdict,
    evidence,
    draftPrUrl,
  }: {
    runId: string;
    verdict: "approve" | "reject" | "changes_requested";
    evidence: string;
    draftPrUrl?: string | null;
  }) => {
    db.prepare(
      `INSERT INTO review_records (run_id, verdict, evidence, draft_pr_url, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(run_id) DO UPDATE SET
         verdict = excluded.verdict,
         evidence = excluded.evidence,
         draft_pr_url = excluded.draft_pr_url,
         created_at = excluded.created_at`,
    ).run(runId, verdict, evidence, draftPrUrl ?? null, new Date().toISOString());
    const run = getRun(runId);
    if (run) logTaskActivity(run.taskId, "review_recorded", { runId, verdict });
    return { ok: true as const };
  };

  const setRunWorktree = ({
    runId,
    worktreePath,
    branchName,
  }: {
    runId: string;
    worktreePath: string;
    branchName: string;
  }) => {
    db.prepare("UPDATE runs SET worktree_path = ?, branch_name = ? WHERE id = ?").run(
      worktreePath,
      branchName,
      runId,
    );
  };

  const approveReviewWithDraftPr = async ({
    runId,
    evidence,
    humanAuthorized,
  }: {
    runId: string;
    evidence: string;
    humanAuthorized: boolean;
  }) => {
    if (!humanAuthorized) {
      return { ok: false as const, error: "human_authorization_required" };
    }
    const run = getRun(runId);
    if (!run) return { ok: false as const, error: "run_not_found" };
    if (run.status !== "completed" && run.status !== "awaiting_intervention") {
      return { ok: false as const, error: "run_not_reviewable" };
    }
    const task = getTask(run.taskId);
    if (!task) return { ok: false as const, error: "task_not_found" };

    saveReview({ runId, verdict: "approve", evidence });

    const ref = parseTaskId(run.taskId);
    const branch =
      run.branchName ?? (ref ? `factory/issue-${ref.number}-${runId.slice(0, 8)}` : null);
    if (!branch || !run.worktreePath) {
      return {
        ok: false as const,
        error: "no_worktree_or_branch",
        review: getReview(runId),
      };
    }

    try {
      const draftPrUrl = await createAuthorizedDraftPr({
        taskId: run.taskId,
        branch,
        title: task.title,
        body: `${evidence}\n\n---\nLinked task: ${run.taskId}`,
        worktreePath: run.worktreePath,
      });
      db.prepare("UPDATE review_records SET draft_pr_url = ? WHERE run_id = ?").run(
        draftPrUrl,
        runId,
      );
      logTaskActivity(run.taskId, "draft_pr_created", { runId, draftPrUrl });
      return { ok: true as const, draftPrUrl, review: getReview(runId) };
    } catch (error) {
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : "draft_pr_failed",
        review: getReview(runId),
      };
    }
  };

  const getReview = (runId: string) => {
    const row = db
      .prepare(
        "SELECT verdict, evidence, draft_pr_url, created_at FROM review_records WHERE run_id = ?",
      )
      .get(runId) as
      | { verdict: string; evidence: string; draft_pr_url: string | null; created_at: string }
      | undefined;
    if (!row) return null;
    return {
      runId,
      verdict: row.verdict,
      evidence: row.evidence,
      draftPrUrl: row.draft_pr_url,
      createdAt: row.created_at,
    };
  };

  const updateRunStatus = ({
    runId,
    status,
    evidence,
    error,
  }: {
    runId: string;
    status: RunStatus;
    evidence?: string | null;
    error?: string | null;
  }) => {
    const run = getRun(runId);
    if (!run) return null;
    if (!canTransitionRun({ from: run.status, to: status })) return null;
    const now = new Date().toISOString();
    db.prepare(
      "UPDATE runs SET status = ?, updated_at = ?, evidence = COALESCE(?, evidence), error = COALESCE(?, error) WHERE id = ?",
    ).run(status, now, evidence ?? null, error ?? null, runId);
    return getRun(runId);
  };

  const cancelRun = (runId: string) => updateRunStatus({ runId, status: "cancelled" });

  const rememberIdempotent = (key: string, response: unknown) => {
    db.prepare(
      "INSERT OR REPLACE INTO idempotency (key, response_json, created_at) VALUES (?, ?, ?)",
    ).run(key, JSON.stringify(response), new Date().toISOString());
  };

  const markRunsUnknownOnRestart = () => {
    db.prepare(
      "UPDATE runs SET status = 'unknown', updated_at = ? WHERE status IN ('queued','preparing','running')",
    ).run(new Date().toISOString());
  };

  return {
    isPaused,
    setPaused,
    getFactoryStatus,
    getGithubConfig,
    setGithubConfig,
    configureGithub: ({
      owner,
      repo,
      projectNumber,
      ownerType,
    }: {
      owner: string;
      repo: string;
      projectNumber?: number | null;
      ownerType?: GithubConfig["ownerType"];
    }) => {
      const config = defaultGithubConfig({
        owner,
        repo,
        ownerType: ownerType ?? "user",
        projectNumber: projectNumber ?? null,
      });
      setGithubConfig(config);
      return config;
    },
    syncGithub,
    listTasks,
    getTask,
    upsertTask,
    updateTask,
    claimTask,
    releaseTask,
    saveHandoff,
    getHandoff,
    listTaskActivity: (taskId: string) => listActivity(db, taskId),
    getRun,
    startRun,
    takeQueuedRun,
    updateRunStatus,
    cancelRun,
    submitResult,
    saveReview,
    approveReviewWithDraftPr,
    setRunWorktree,
    getReview,
    rememberIdempotent,
    markRunsUnknownOnRestart,
    logTaskActivity,
    setGithubError: (message: string | null) => setMeta(db, "github_error", message ?? ""),
    setGithubRepo: (repo: string | null) => setMeta(db, "github_repo", repo ?? ""),
  };
};

export type Store = ReturnType<typeof createStore>;
