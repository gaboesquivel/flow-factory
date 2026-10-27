import { parseTaskId, type KanbanColumn } from "@flow-factory/domain";

import { columnToProjectStatusName } from "./map.js";
import { ghApiJson, ghApiPatch, ghGraphql } from "./gh.js";
import type { GithubConfig } from "./types.js";

type ProjectWriteContext = {
  projectId: string;
  statusFieldId: string;
  optionIdByName: Map<string, string>;
  itemIdByIssue: Map<number, string>;
};

const loadProjectWriteContext = async (
  config: GithubConfig,
): Promise<{ ok: true; context: ProjectWriteContext } | { ok: false; error: string }> => {
  if (!config.projectNumber) return { ok: false, error: "project_not_configured" };

  const query =
    config.ownerType === "organization"
      ? `query($owner: String!, $number: Int!) {
      organization(login: $owner) {
        projectV2(number: $number) {
          id
          fields(first: 30) {
            nodes {
              ... on ProjectV2SingleSelectField {
                id
                name
                options { id name }
              }
            }
          }
          items(first: 100) {
            nodes {
              id
              content { ... on Issue { number } }
            }
          }
        }
      }
    }`
      : `query($owner: String!, $number: Int!) {
      user(login: $owner) {
        projectV2(number: $number) {
          id
          fields(first: 30) {
            nodes {
              ... on ProjectV2SingleSelectField {
                id
                name
                options { id name }
              }
            }
          }
          items(first: 100) {
            nodes {
              id
              content { ... on Issue { number } }
            }
          }
        }
      }
    }`;

  try {
    const data = await ghGraphql<{
      organization?: { projectV2?: ProjectNode };
      user?: { projectV2?: ProjectNode };
    }>(query, { owner: config.owner, number: config.projectNumber });

    const project =
      config.ownerType === "organization" ? data.organization?.projectV2 : data.user?.projectV2;
    if (!project?.id) return { ok: false, error: "project_not_found" };

    const optionIdByName = new Map<string, string>();
    let statusFieldId: string | null = null;
    for (const field of project.fields?.nodes ?? []) {
      const node = field as {
        id?: string;
        name?: string;
        options?: { id: string; name: string }[];
      };
      if (node.name !== config.statusFieldName || !node.id) continue;
      statusFieldId = node.id;
      for (const option of node.options ?? []) optionIdByName.set(option.name, option.id);
    }
    if (!statusFieldId) return { ok: false, error: "status_field_not_found" };

    const itemIdByIssue = new Map<number, string>();
    for (const item of project.items?.nodes ?? []) {
      const node = item as { id?: string; content?: { number?: number } };
      if (node.id && node.content?.number) itemIdByIssue.set(node.content.number, node.id);
    }

    return {
      ok: true,
      context: {
        projectId: project.id,
        statusFieldId,
        optionIdByName,
        itemIdByIssue,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "project_write_context_failed";
    if (message.includes("read:project") || message.includes("project")) {
      return { ok: false, error: "GitHub project scope missing (run: gh auth refresh -s project)" };
    }
    return { ok: false, error: message };
  }
};

type ProjectNode = {
  id: string;
  fields?: { nodes?: unknown[] };
  items?: { nodes?: unknown[] };
};

const fetchIssueNodeId = async ({
  owner,
  repo,
  number,
}: {
  owner: string;
  repo: string;
  number: number;
}) => {
  const query = `query($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) { id }
    }
  }`;
  const data = await ghGraphql<{ repository?: { issue?: { id: string } } }>(query, {
    owner,
    repo,
    number,
  });
  return data.repository?.issue?.id ?? null;
};

const addIssueToProject = async ({
  projectId,
  contentId,
}: {
  projectId: string;
  contentId: string;
}) => {
  const mutation = `mutation($projectId: ID!, $contentId: ID!) {
    addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
      item { id }
    }
  }`;
  const data = await ghGraphql<{ addProjectV2ItemById?: { item?: { id: string } } }>(mutation, {
    projectId,
    contentId,
  });
  return data.addProjectV2ItemById?.item?.id ?? null;
};

const writeProjectStatus = async ({
  config,
  issueNumber,
  statusName,
}: {
  config: GithubConfig;
  issueNumber: number;
  statusName: string;
}) => {
  const loaded = await loadProjectWriteContext(config);
  if (!loaded.ok) return { ok: false as const, error: loaded.error };
  const { context } = loaded;

  let itemId = context.itemIdByIssue.get(issueNumber);
  if (!itemId) {
    const contentId = await fetchIssueNodeId({
      owner: config.owner,
      repo: config.repo,
      number: issueNumber,
    });
    if (!contentId) return { ok: false as const, error: "issue_not_found" };
    const addedItemId = await addIssueToProject({ projectId: context.projectId, contentId });
    if (!addedItemId) return { ok: false as const, error: "add_to_project_failed" };
    itemId = addedItemId;
  }

  const optionId = context.optionIdByName.get(statusName);
  if (!optionId) return { ok: false as const, error: "status_option_not_found" };

  const mutation = `mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $projectId,
      itemId: $itemId,
      fieldId: $fieldId,
      value: { singleSelectOptionId: $optionId }
    }) {
      projectV2Item { id }
    }
  }`;

  await ghGraphql(mutation, {
    projectId: context.projectId,
    itemId,
    fieldId: context.statusFieldId,
    optionId,
  });
  return { ok: true as const, mode: "project" as const };
};

const writeColumnLabel = async ({
  owner,
  repo,
  issueNumber,
  column,
}: {
  owner: string;
  repo: string;
  issueNumber: number;
  column: KanbanColumn;
}) => {
  const issue = await ghApiJson<{ labels: { name: string }[] }>(
    `repos/${owner}/${repo}/issues/${issueNumber}`,
  );
  const labels = issue.labels
    .map((label) => label.name)
    .filter((name) => !name.startsWith("factory-column:"));
  labels.push(`factory-column:${column}`);
  await ghApiPatch(`repos/${owner}/${repo}/issues/${issueNumber}`, { labels });
  return { ok: true as const, mode: "label" as const };
};

export const writeTaskColumnToGithub = async ({
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

  if (config.projectNumber && statusName) {
    const project = await writeProjectStatus({
      config,
      issueNumber: ref.number,
      statusName,
    });
    if (project.ok) return project;
    if (project.error !== "status_option_not_found") return project;
  }

  try {
    return await writeColumnLabel({
      owner: ref.owner,
      repo: ref.repo,
      issueNumber: ref.number,
      column,
    });
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "label_write_failed",
    };
  }
};
