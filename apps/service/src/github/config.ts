import type { KanbanColumn } from "@flow-factory/domain";

import type { GithubConfig } from "./types.js";

export const defaultStatusFieldMap: Record<string, KanbanColumn> = {
  Backlog: "backlog",
  Ready: "ready",
  "In progress": "in_progress",
  "In review": "in_review",
  Done: "done",
};

export const defaultGithubConfig = ({
  owner,
  repo,
  ownerType,
  projectNumber = null,
}: {
  owner: string;
  repo: string;
  ownerType: GithubConfig["ownerType"];
  projectNumber?: number | null;
}): GithubConfig => ({
  owner,
  repo,
  ownerType,
  projectNumber,
  statusFieldName: "Status",
  statusFieldMap: defaultStatusFieldMap,
});
