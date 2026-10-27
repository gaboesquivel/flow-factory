import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const probeCursor = async () => {
  try {
    const { stdout } = await execFileAsync("agent", ["status"], {
      timeout: 5000,
    });
    if (/not logged in/i.test(stdout)) {
      return { available: false, reason: "Cursor CLI not logged in (run agent login)" };
    }
    return { available: true, reason: null };
  } catch (error) {
    return {
      available: false,
      reason: error instanceof Error ? error.message : "Cursor CLI unavailable",
    };
  }
};

export const probeOllama = async () => {
  try {
    await execFileAsync("ollama", ["--version"], { timeout: 3000 });
    return { available: true, reason: null };
  } catch {
    return { available: false, reason: "Ollama not installed" };
  }
};
