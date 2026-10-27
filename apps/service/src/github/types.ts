import type { KanbanColumn } from "@flow-factory/domain";

export type GithubOwnerType = "user" | "organization";

export type GithubConfig = {
  owner: string;
  repo: string;
  ownerType: GithubOwnerType;
  projectNumber: number | null;
  statusFieldName: string;
  statusFieldMap: Record<string, KanbanColumn>;
};

export type GithubIssue = {
  number: number;
  title: string;
  body: string | null;
  labels: { name: string }[];
  assignees: { login: string }[];
};
