import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const ensureRunWorktree = async ({
  repoRoot,
  runId,
  baseRef = "main",
}: {
  repoRoot: string;
  runId: string;
  baseRef?: string;
}) => {
  const path = join(repoRoot, ".data", "worktrees", runId);
  if (existsSync(join(path, ".git"))) return path;

  await execFileAsync(
    "git",
    ["worktree", "add", "-B", `factory/run-${runId.slice(0, 8)}`, path, baseRef],
    { cwd: repoRoot },
  );
  return path;
};

export const removeRunWorktree = async ({
  repoRoot,
  runId,
}: {
  repoRoot: string;
  runId: string;
}) => {
  const path = join(repoRoot, ".data", "worktrees", runId);
  if (!existsSync(path)) return;
  await execFileAsync("git", ["worktree", "remove", "--force", path], { cwd: repoRoot }).catch(
    () => undefined,
  );
};
