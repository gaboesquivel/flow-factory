import { readFileSync } from "node:fs";
import { join } from "node:path";

const agentRoot = join(process.cwd(), "agent");

const TARGETING_PATHS = [
  "lib/github/repo-sandbox.ts",
  "lib/github/git-remote.ts",
  "subagents/implementer/instructions.md",
  "subagents/analyst/instructions.md",
  "subagents/reviewer/instructions.md",
] as const;

const FLOW_FACTORY_REPO = "gaboesquivel/flow-factory";

/**
 * Ensures station sandboxes and instructions target `FACTORY_REPO`, not this
 * factory's own repository, unless that repository is the configured target.
 */
export const assertFactoryRepoTargeting = (factoryRepo: string) => {
  if (factoryRepo === FLOW_FACTORY_REPO) {
    return;
  }
  for (const relative of TARGETING_PATHS) {
    const text = readFileSync(join(agentRoot, relative), "utf8");
    if (text.includes(FLOW_FACTORY_REPO)) {
      throw new Error(
        `${relative} must not hardcode '${FLOW_FACTORY_REPO}' when FACTORY_REPO is '${factoryRepo}'.`
      );
    }
  }
};
