import { formatTaskId, type KanbanColumn } from "@flow-factory/domain";

import { columnFromLabels, parseAcceptanceCriteria } from "./parse.js";
import { isBlockedFromLabels, mapProjectStatusToColumn } from "./map.js";
import { ghApiJson, ghGraphql, detectOwnerType } from "./gh.js";
import type { GithubConfig, GithubIssue } from "./types.js";

type ProjectStatusByIssue = Map<number, string>;

const fetchProjectStatuses = async (config: GithubConfig) => {
  const statuses: ProjectStatusByIssue = new Map();
  if (!config.projectNumber) return { statuses, error: null as string | null };

  const query =
    config.ownerType === "organization"
      ? `query($owner: String!, $number: Int!) {
      organization(login: $owner) {
        projectV2(number: $number) {
          items(first: 100) {
            nodes {
              content { ... on Issue { number } }
              fieldValues(first: 20) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field { ... on ProjectV2SingleSelectField { name } }
                  }
                }
              }
            }
          }
        }
      }
    }`
      : `query($owner: String!, $number: Int!) {
      user(login: $owner) {
        projectV2(number: $number) {
          items(first: 100) {
            nodes {
              content { ... on Issue { number } }
              fieldValues(first: 20) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field { ... on ProjectV2SingleSelectField { name } }
                  }
                }
              }
            }
          }
        }
      }
    }`;

  try {
    const data = await ghGraphql<{
      organization?: { projectV2?: { items: { nodes: unknown[] } } };
      user?: { projectV2?: { items: { nodes: unknown[] } } };
    }>(query, { owner: config.owner, number: config.projectNumber });

    const project =
      config.ownerType === "organization" ? data.organization?.projectV2 : data.user?.projectV2;

    for (const node of project?.items?.nodes ?? []) {
      const item = node as {
        content?: { number?: number };
        fieldValues?: { nodes?: unknown[] };
      };
      const issueNumber = item.content?.number;
      if (!issueNumber) continue;
      for (const fieldValue of item.fieldValues?.nodes ?? []) {
        const value = fieldValue as {
          name?: string;
          field?: { name?: string };
        };
        if (value.field?.name === config.statusFieldName && value.name) {
          statuses.set(issueNumber, value.name);
        }
      }
    }
    return { statuses, error: null };
  } catch (error) {
    return {
      statuses,
      error:
        error instanceof Error
          ? error.message.includes("read:project")
            ? "GitHub project scope missing (run: gh auth refresh -s project)"
            : error.message
          : "project_sync_failed",
    };
  }
};

export const syncGithubIssues = async (input: GithubConfig) => {
  const config = {
    ...input,
    ownerType: input.ownerType ?? (await detectOwnerType(input.owner)),
  };
  const issues = await ghApiJson<GithubIssue[]>(
    `repos/${config.owner}/${config.repo}/issues?state=open&per_page=100`,
  );
  const filtered = issues.filter((issue) => !("pull_request" in issue));

  const { statuses, error: projectError } = await fetchProjectStatuses(config);

  const tasks = filtered.map((issue) => {
    const id = formatTaskId({ owner: config.owner, repo: config.repo, number: issue.number });
    const labelColumn = columnFromLabels(issue.labels);
    const projectStatus = statuses.get(issue.number) ?? null;
    const column =
      (labelColumn as KanbanColumn | null) ??
      mapProjectStatusToColumn({
        statusName: projectStatus,
        config,
        fallback: "backlog",
      });

    return {
      id,
      title: issue.title,
      body: issue.body ?? "",
      column,
      blocked: isBlockedFromLabels(issue.labels),
      priority: issue.labels.find((label) => label.name.startsWith("priority:"))?.name ?? null,
      assignee: issue.assignees[0]?.login ?? null,
      activeSpecialist: null,
      acceptanceCriteria: parseAcceptanceCriteria(issue.body),
      runId: null,
      runStatus: null,
      syncError: projectError,
    };
  });

  return {
    tasks,
    projectError,
    repo: `${config.owner}/${config.repo}`,
  };
};
