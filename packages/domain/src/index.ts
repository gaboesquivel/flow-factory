export const kanbanColumns = ["backlog", "ready", "in_progress", "in_review", "done"] as const;

export type KanbanColumn = (typeof kanbanColumns)[number];

export const runStatuses = [
  "queued",
  "preparing",
  "running",
  "awaiting_intervention",
  "completed",
  "failed",
  "cancelled",
  "timed_out",
  "unknown",
] as const;

export type RunStatus = (typeof runStatuses)[number];

export const specialistRoles = ["product", "design", "dev", "qa", "research"] as const;

export type SpecialistRole = (typeof specialistRoles)[number];

export type TaskRef = {
  owner: string;
  repo: string;
  number: number;
};

export const formatTaskId = ({ owner, repo, number }: TaskRef) => `${owner}/${repo}#${number}`;

export const parseTaskId = (id: string): TaskRef | null => {
  const match = /^([^/]+)\/([^#]+)#(\d+)$/.exec(id);
  if (!match) return null;
  return { owner: match[1], repo: match[2], number: Number(match[3]) };
};

export type TaskRecord = {
  id: string;
  title: string;
  body: string;
  column: KanbanColumn;
  blocked: boolean;
  priority: string | null;
  assignee: string | null;
  activeSpecialist: SpecialistRole | null;
  revision: number;
  acceptanceCriteria: string[];
  runId: string | null;
  runStatus: RunStatus | null;
  syncError: string | null;
};

export type HandoffRecord = {
  taskId: string;
  summary: string;
  nextAction: string;
  context: string;
  updatedAt: string;
  revision: number;
};

export type RunRecord = {
  id: string;
  taskId: string;
  status: RunStatus;
  specialist: SpecialistRole;
  adapter: "cursor" | "ollama" | "none";
  model: string | null;
  worktreePath: string | null;
  branchName: string | null;
  createdAt: string;
  updatedAt: string;
  evidence: string | null;
  error: string | null;
};

export type FactoryStatus = {
  paused: boolean;
  github: { connected: boolean; error: string | null };
  adapters: {
    cursor: { available: boolean; reason: string | null };
    ollama: { available: boolean; reason: string | null };
  };
};

export const isTerminalRunStatus = (status: RunStatus) =>
  status === "completed" || status === "failed" || status === "cancelled" || status === "timed_out";

export const canTransitionRun = ({ from, to }: { from: RunStatus; to: RunStatus }) => {
  if (from === to) return true;
  if (isTerminalRunStatus(from)) return false;
  return true;
};
