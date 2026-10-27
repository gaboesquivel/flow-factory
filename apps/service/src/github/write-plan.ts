import { parseTaskId, type KanbanColumn } from "@flow-factory/domain";

import { columnToProjectStatusName } from "./map.js";
import type { GithubConfig } from "./types.js";

export const planTaskColumnWrite = ({
  config,
  taskId,
  column,
}: {
  config: GithubConfig;
  taskId: string;
  column: KanbanColumn;
}) => {
  const ref = parseTaskId(taskId);
  if (!ref) return { ok: false as const, error: "invalid_task_id" };
  if (ref.owner !== config.owner || ref.repo !== config.repo) {
    return { ok: false as const, error: "task_repo_mismatch" };
  }

  const statusName = columnToProjectStatusName({ column, config });
  const mode = config.projectNumber && statusName ? ("project" as const) : ("label" as const);

  return { ok: true as const, ref, mode, statusName };
};
