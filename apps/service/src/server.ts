import { createServer } from "node:http";

import type { KanbanColumn, SpecialistRole } from "@flow-factory/domain";

import { authorizeRequest } from "./auth.js";
import type { Store } from "./store.js";

const readJson = async (request: import("node:http").IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
};

const sendJson = (response: import("node:http").ServerResponse, status: number, body: unknown) => {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
};

export const createHttpServer = ({
  store,
  token,
  onMutation,
}: {
  store: Store;
  token: string;
  onMutation?: () => void;
}) =>
  createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
    const path = url.pathname;
    const method = request.method ?? "GET";

    if (path === "/health" && method === "GET") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (path === "/v1/factory/status" && method === "GET") {
      sendJson(response, 200, await store.getFactoryStatus());
      return;
    }

    if (path === "/v1/github/config" && method === "GET") {
      sendJson(response, 200, { config: store.getGithubConfig() });
      return;
    }

    const needsAuth = method !== "GET";

    if (needsAuth && !authorizeRequest({ header: request.headers.authorization, token })) {
      sendJson(response, 401, { error: "unauthorized" });
      return;
    }

    if (path === "/v1/tasks" && method === "GET") {
      sendJson(response, 200, { tasks: store.listTasks() });
      return;
    }

    if (path.startsWith("/v1/tasks/") && method === "GET") {
      const id = decodeURIComponent(path.slice("/v1/tasks/".length));
      const task = store.getTask(id);
      if (!task) {
        sendJson(response, 404, { error: "task_not_found" });
        return;
      }
      sendJson(response, 200, {
        task,
        handoff: store.getHandoff(id),
        activity: store.listTaskActivity(id),
      });
      return;
    }

    if (path === "/v1/tasks" && method === "POST") {
      const body = await readJson(request);
      const id = String(body.id ?? "");
      if (!id) {
        sendJson(response, 400, { error: "id_required" });
        return;
      }
      const task = store.upsertTask({
        id,
        title: String(body.title ?? "Untitled"),
        body: String(body.body ?? ""),
        column: (body.column as KanbanColumn) ?? "backlog",
        blocked: Boolean(body.blocked),
        priority: body.priority ? String(body.priority) : null,
        assignee: body.assignee ? String(body.assignee) : null,
        activeSpecialist: body.activeSpecialist as SpecialistRole | null,
        acceptanceCriteria: Array.isArray(body.acceptanceCriteria)
          ? body.acceptanceCriteria.map(String)
          : [],
        runId: null,
        runStatus: null,
        syncError: body.syncError ? String(body.syncError) : null,
      });
      sendJson(response, 201, { task });
      return;
    }

    if (path.endsWith("/claim") && method === "POST") {
      const taskId = decodeURIComponent(path.slice("/v1/tasks/".length, -"/claim".length));
      const body = await readJson(request);
      const result = store.claimTask({
        taskId,
        holder: String(body.holder ?? "unknown"),
        expectedRevision: body.revision !== undefined ? Number(body.revision) : undefined,
      });
      sendJson(response, result.ok ? 200 : 409, result);
      return;
    }

    if (path.endsWith("/release") && method === "POST") {
      const taskId = decodeURIComponent(path.slice("/v1/tasks/".length, -"/release".length));
      const body = await readJson(request);
      const result = store.releaseTask({
        taskId,
        holder: String(body.holder ?? "unknown"),
        expectedRevision: body.revision !== undefined ? Number(body.revision) : undefined,
      });
      sendJson(response, result.ok ? 200 : 409, result);
      return;
    }

    if (path.endsWith("/handoff") && method === "POST") {
      const taskId = decodeURIComponent(path.slice("/v1/tasks/".length, -"/handoff".length));
      const body = await readJson(request);
      const result = store.saveHandoff({
        taskId,
        summary: String(body.summary ?? ""),
        nextAction: String(body.nextAction ?? ""),
        context: String(body.context ?? ""),
        expectedRevision: body.revision !== undefined ? Number(body.revision) : undefined,
      });
      sendJson(response, result.ok ? 200 : 409, result);
      return;
    }

    if (path === "/v1/runs" && method === "POST") {
      const body = await readJson(request);
      const idempotencyKey = String(
        request.headers["idempotency-key"] ?? body.idempotencyKey ?? "",
      );
      if (!idempotencyKey) {
        sendJson(response, 400, { error: "idempotency_key_required" });
        return;
      }
      try {
        const result = store.startRun({
          taskId: String(body.taskId ?? ""),
          specialist: body.specialist as SpecialistRole,
          adapter: body.adapter as "cursor" | "ollama",
          model: body.model ? String(body.model) : null,
          idempotencyKey,
        });
        sendJson(response, 201, result);
      } catch (error) {
        sendJson(response, 409, {
          error: error instanceof Error ? error.message : "start_failed",
        });
      }
      return;
    }

    if (path.startsWith("/v1/runs/") && method === "GET") {
      const id = decodeURIComponent(path.slice("/v1/runs/".length));
      const run = store.getRun(id);
      if (!run) {
        sendJson(response, 404, { error: "run_not_found" });
        return;
      }
      sendJson(response, 200, { run });
      return;
    }

    if (path.endsWith("/cancel") && method === "POST") {
      const runId = decodeURIComponent(path.slice("/v1/runs/".length, -"/cancel".length));
      const run = store.cancelRun(runId);
      if (!run) {
        sendJson(response, 409, { error: "cancel_failed" });
        return;
      }
      sendJson(response, 200, { run });
      return;
    }

    if (path === "/v1/factory/pause" && method === "POST") {
      store.setPaused(true);
      sendJson(response, 200, { paused: true });
      return;
    }

    if (path === "/v1/factory/resume" && method === "POST") {
      store.setPaused(false);
      sendJson(response, 200, { paused: false });
      return;
    }

    if (path === "/v1/github/config" && method === "POST") {
      const body = await readJson(request);
      const config = store.configureGithub({
        owner: String(body.owner ?? ""),
        repo: String(body.repo ?? ""),
        projectNumber: body.projectNumber ? Number(body.projectNumber) : null,
        ownerType: body.ownerType as "user" | "organization" | undefined,
      });
      sendJson(response, 200, { config });
      onMutation?.();
      return;
    }

    if (path === "/v1/github/sync" && method === "POST") {
      const result = await store.syncGithub();
      sendJson(response, result.ok ? 200 : 502, result);
      onMutation?.();
      return;
    }

    if (path.startsWith("/v1/tasks/") && path.endsWith("/update") && method === "POST") {
      const taskId = decodeURIComponent(path.slice("/v1/tasks/".length, -"/update".length));
      const body = await readJson(request);
      const result = store.updateTask({
        taskId,
        column: body.column as KanbanColumn | undefined,
        blocked: body.blocked !== undefined ? Boolean(body.blocked) : undefined,
        expectedRevision: body.revision !== undefined ? Number(body.revision) : undefined,
      });
      sendJson(response, result.ok ? 200 : 409, result);
      onMutation?.();
      return;
    }

    if (path === "/v1/runs/submit-result" && method === "POST") {
      const body = await readJson(request);
      const result = store.submitResult({
        runId: String(body.runId ?? ""),
        evidence: String(body.evidence ?? ""),
        verified: Boolean(body.verified),
      });
      sendJson(response, result.ok ? 200 : 409, result);
      onMutation?.();
      return;
    }

    if (path === "/v1/reviews" && method === "POST") {
      const body = await readJson(request);
      const result = store.saveReview({
        runId: String(body.runId ?? ""),
        verdict: body.verdict as "approve" | "reject" | "changes_requested",
        evidence: String(body.evidence ?? ""),
        draftPrUrl: body.draftPrUrl ? String(body.draftPrUrl) : null,
      });
      sendJson(response, 200, result);
      return;
    }

    if (path.startsWith("/v1/reviews/") && method === "GET") {
      const runId = decodeURIComponent(path.slice("/v1/reviews/".length));
      const review = store.getReview(runId);
      if (!review) {
        sendJson(response, 404, { error: "review_not_found" });
        return;
      }
      sendJson(response, 200, { review });
      return;
    }

    sendJson(response, 404, { error: "not_found" });
  });
