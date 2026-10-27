import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

import { parseTaskId } from "@flow-factory/domain";

import type { Store } from "./store.js";
import { ensureRunWorktree } from "./worktree.js";

const execFileAsync = promisify(execFile);

let dispatching = false;

const runOllama = async ({ model, prompt }: { model: string; prompt: string }) => {
  const { stdout } = await execFileAsync("ollama", ["run", model, prompt], {
    timeout: 120_000,
    maxBuffer: 2 * 1024 * 1024,
  });
  return stdout.trim();
};

const runCursor = async ({
  workspace,
  model,
  prompt,
}: {
  workspace: string;
  model: string | null;
  prompt: string;
}) => {
  const args = ["-p", "--output-format", "json", "--trust", "--workspace", workspace, prompt];
  if (model) args.splice(1, 0, "--model", model);

  return new Promise<string>((resolve, reject) => {
    const child = spawn("agent", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code) => {
      if (code !== 0) reject(new Error(stderr || stdout || `agent exit ${code}`));
      else resolve(stdout);
    });
  });
};

export const createCoordinator = ({ store, repoRoot }: { store: Store; repoRoot: string }) => {
  mkdirSync(join(repoRoot, ".data", "worktrees"), { recursive: true });

  const dispatchOnce = async () => {
    if (dispatching || store.isPaused()) return;
    const queued = store.takeQueuedRun();
    if (!queued) return;

    dispatching = true;
    const runId = queued.id;
    try {
      store.updateRunStatus({ runId, status: "running" });

      const task = store.getTask(queued.taskId);
      const prompt = task
        ? `Task ${task.id}: ${task.title}\n\n${task.body}\n\nAcceptance:\n${task.acceptanceCriteria.join("\n")}`
        : `Task ${queued.taskId}`;

      let workspace = repoRoot;
      if (queued.adapter === "cursor") {
        const ref = parseTaskId(queued.taskId);
        const branch = ref
          ? `factory/issue-${ref.number}-${runId.slice(0, 8)}`
          : `factory/run-${runId.slice(0, 8)}`;
        workspace = await ensureRunWorktree({ repoRoot, runId, baseRef: "main" });
        store.setRunWorktree({ runId, worktreePath: workspace, branchName: branch });
      }

      const evidence =
        queued.adapter === "ollama"
          ? await runOllama({ model: queued.model ?? "qwen3:4b", prompt })
          : await runCursor({
              workspace,
              model: queued.model,
              prompt,
            });

      const current = store.getRun(runId);
      if (!current || current.status === "cancelled") return;

      store.updateRunStatus({ runId, status: "completed", evidence });
      store.logTaskActivity(queued.taskId, "run_completed", { runId, workspace });
    } catch (error) {
      const current = store.getRun(runId);
      if (current && current.status !== "cancelled") {
        store.updateRunStatus({
          runId,
          status: "failed",
          error: error instanceof Error ? error.message : "run_failed",
        });
      }
    } finally {
      dispatching = false;
    }
  };

  return {
    tick: () => {
      void dispatchOnce();
    },
  };
};
