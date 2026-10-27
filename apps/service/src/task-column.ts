import type { KanbanColumn } from "@flow-factory/domain";

import { writeTaskColumnToGithub } from "./github/project-write.js";
import type { Store } from "./store.js";

export const syncTaskColumnToGithub = async ({
  store,
  taskId,
  column,
}: {
  store: Store;
  taskId: string;
  column: KanbanColumn;
}) => {
  const config = store.getGithubConfig();
  if (!config) return null;
  const write = await writeTaskColumnToGithub({ config, taskId, column });
  store.setTaskSyncError({ taskId, syncError: write.ok ? null : write.error });
  return write;
};

export const moveTaskColumn = async ({
  store,
  taskId,
  column,
  expectedRevision,
}: {
  store: Store;
  taskId: string;
  column: KanbanColumn;
  expectedRevision?: number;
}) => {
  const result = store.updateTask({ taskId, column, expectedRevision });
  if (!result.ok) return { ...result, github: null };

  const github = await syncTaskColumnToGithub({ store, taskId, column: result.task.column });
  const task = store.getTask(taskId);
  return { ok: true as const, task: task ?? result.task, github };
};
