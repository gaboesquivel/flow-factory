import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { parseTaskId } from "@flow-factory/domain";

const execFileAsync = promisify(execFile);

export const createAuthorizedDraftPr = async ({
  taskId,
  branch,
  title,
  body,
  worktreePath,
}: {
  taskId: string;
  branch: string;
  title: string;
  body: string;
  worktreePath: string;
}) => {
  const ref = parseTaskId(taskId);
  if (!ref) throw new Error("invalid_task_id");

  await execFileAsync("git", ["checkout", "-B", branch], { cwd: worktreePath });

  const { stdout: status } = await execFileAsync("git", ["status", "--porcelain"], {
    cwd: worktreePath,
  });
  if (!status.trim()) throw new Error("no_changes_in_worktree");

  await execFileAsync("git", ["add", "-A"], { cwd: worktreePath });
  await execFileAsync("git", ["commit", "-m", `factory: ${title}`], { cwd: worktreePath }).catch(
    () => undefined,
  );

  await execFileAsync("git", ["push", "-u", "origin", branch], { cwd: worktreePath });

  const { stdout } = await execFileAsync(
    "gh",
    [
      "pr",
      "create",
      "--draft",
      "--base",
      "main",
      "--head",
      branch,
      "--title",
      title,
      "--body",
      body,
    ],
    { cwd: worktreePath, maxBuffer: 2 * 1024 * 1024, timeout: 120_000 },
  );

  const url = stdout.trim().split("\n").pop()?.trim();
  if (!url?.startsWith("http")) throw new Error("draft_pr_url_missing");

  await execFileAsync(
    "gh",
    [
      "issue",
      "comment",
      String(ref.number),
      "--repo",
      `${ref.owner}/${ref.repo}`,
      "--body",
      `Factory draft PR: ${url}`,
    ],
    { timeout: 30_000 },
  ).catch(() => undefined);

  return url;
};
