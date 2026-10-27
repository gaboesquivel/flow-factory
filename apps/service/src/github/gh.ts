import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const ghApiJson = async <T>(endpoint: string): Promise<T> => {
  const { stdout } = await execFileAsync("gh", ["api", endpoint, "--jq", "."], {
    maxBuffer: 10 * 1024 * 1024,
    timeout: 60_000,
  });
  return JSON.parse(stdout) as T;
};

export const ghGraphql = async <T>(query: string, variables: Record<string, unknown>) =>
  new Promise<T>((resolve, reject) => {
    const child = spawn("gh", ["api", "graphql"], { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || stdout || `gh graphql exit ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout) as T);
      } catch (error) {
        reject(error);
      }
    });
    child.stdin.end(JSON.stringify({ query, variables }));
  });

export const probeGhAuth = async () => {
  try {
    await execFileAsync("gh", ["auth", "status"], { timeout: 5000 });
    return { ok: true as const, error: null };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "gh not available",
    };
  }
};

export const detectOwnerType = async (owner: string) => {
  try {
    await ghApiJson(`orgs/${owner}`);
    return "organization" as const;
  } catch {
    return "user" as const;
  }
};
