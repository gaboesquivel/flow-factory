import type { KanbanColumn } from "@flow-factory/domain";

import type { GithubConfig } from "./types.js";

export const mapProjectStatusToColumn = ({
  statusName,
  config,
  fallback,
}: {
  statusName: string | null;
  config: GithubConfig;
  fallback: KanbanColumn;
}): KanbanColumn => {
  if (!statusName) return fallback;
  const mapped = config.statusFieldMap[statusName];
  return mapped ?? fallback;
};

export const isBlockedFromLabels = (labels: { name: string }[]) =>
  labels.some((label) => label.name === "blocked" || label.name === "factory-blocked");
