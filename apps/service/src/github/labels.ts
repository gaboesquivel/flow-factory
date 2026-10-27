import type { KanbanColumn } from "@flow-factory/domain";

export const mergeFactoryColumnLabels = ({
  labels,
  column,
}: {
  labels: string[];
  column: KanbanColumn;
}) => {
  const next = labels.filter((name) => !name.startsWith("factory-column:"));
  next.push(`factory-column:${column}`);
  return next;
};
