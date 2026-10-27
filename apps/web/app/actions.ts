"use server";

import { revalidatePath } from "next/cache";

import { factoryFetch } from "../lib/factory-api";

export const syncGithub = async () => {
  const result = await factoryFetch("/v1/github/sync", { method: "POST" });
  revalidatePath("/");
  return result;
};

export const claimTask = async ({ taskId, holder }: { taskId: string; holder: string }) => {
  const result = await factoryFetch(`/v1/tasks/${encodeURIComponent(taskId)}/claim`, {
    method: "POST",
    body: { holder },
  });
  revalidatePath("/");
  revalidatePath(`/tasks/${encodeURIComponent(taskId)}`);
  return result;
};

export const saveHandoffAction = async ({
  taskId,
  summary,
  nextAction,
  context,
}: {
  taskId: string;
  summary: string;
  nextAction: string;
  context: string;
}) => {
  const result = await factoryFetch(`/v1/tasks/${encodeURIComponent(taskId)}/handoff`, {
    method: "POST",
    body: { summary, nextAction, context },
  });
  revalidatePath(`/tasks/${encodeURIComponent(taskId)}`);
  return result;
};

export const draftPrAction = async ({ runId, evidence }: { runId: string; evidence: string }) => {
  const result = await factoryFetch("/v1/reviews/draft-pr", {
    method: "POST",
    body: { runId, evidence, humanAuthorized: true },
  });
  return result;
};

export const discardWorktreeAction = async ({ runId }: { runId: string }) => {
  const result = await factoryFetch(`/v1/runs/${encodeURIComponent(runId)}/worktree/discard`, {
    method: "POST",
  });
  return result;
};

export const startRunAction = async ({
  taskId,
  specialist,
  adapter,
}: {
  taskId: string;
  specialist: string;
  adapter: "cursor" | "ollama";
}) => {
  const result = await factoryFetch("/v1/runs", {
    method: "POST",
    body: {
      taskId,
      specialist,
      adapter,
      idempotencyKey: `web-${taskId}-${Date.now()}`,
    },
  });
  revalidatePath(`/tasks/${encodeURIComponent(taskId)}`);
  return result;
};
