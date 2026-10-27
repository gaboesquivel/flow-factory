import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { join } from "node:path";
import { z } from "zod";

import { kanbanColumns } from "@flow-factory/domain";

import { openDatabase } from "./db.js";
import { createStore } from "./store.js";
import { resolveDbPath } from "./config.js";
import { moveTaskColumn } from "./task-column.js";

const dataDir = process.env.FLOW_FACTORY_DATA_DIR ?? join(process.cwd(), ".data");
const db = openDatabase(resolveDbPath(dataDir));
const store = createStore(db);

const server = new McpServer({ name: "flow-factory", version: "0.1.0" });

server.registerTool(
  "list_tasks",
  { description: "List GitHub-backed factory tasks", inputSchema: {} },
  async () => ({
    content: [
      { type: "text" as const, text: JSON.stringify({ tasks: store.listTasks() }, null, 2) },
    ],
  }),
);

server.registerTool(
  "get_task",
  {
    description: "Get one task with handoff and activity",
    inputSchema: { taskId: z.string() },
  },
  async ({ taskId }) => {
    const task = store.getTask(taskId);
    if (!task) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: "not_found" }) }],
      };
    }
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              task,
              handoff: store.getHandoff(taskId),
              activity: store.listTaskActivity(taskId),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerTool(
  "sync_github",
  { description: "Pull issues from configured GitHub repository", inputSchema: {} },
  async () => ({
    content: [{ type: "text" as const, text: JSON.stringify(await store.syncGithub(), null, 2) }],
  }),
);

server.registerTool(
  "claim_task",
  {
    description: "Exclusive claim for Work Here",
    inputSchema: { taskId: z.string(), holder: z.string() },
  },
  async ({ taskId, holder }) => ({
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(store.claimTask({ taskId, holder }), null, 2),
      },
    ],
  }),
);

server.registerTool(
  "save_handoff",
  {
    description: "Persist task continuity handoff",
    inputSchema: {
      taskId: z.string(),
      summary: z.string(),
      nextAction: z.string(),
      context: z.string(),
    },
  },
  async ({ taskId, summary, nextAction, context }) => ({
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(store.saveHandoff({ taskId, summary, nextAction, context }), null, 2),
      },
    ],
  }),
);

server.registerTool(
  "release_task",
  {
    description: "Release an exclusive task claim",
    inputSchema: { taskId: z.string(), holder: z.string() },
  },
  async ({ taskId, holder }) => ({
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(store.releaseTask({ taskId, holder }), null, 2),
      },
    ],
  }),
);

server.registerTool(
  "submit_result",
  {
    description: "Submit verified or unverified run evidence",
    inputSchema: {
      runId: z.string(),
      evidence: z.string(),
      verified: z.boolean(),
    },
  },
  async ({ runId, evidence, verified }) => ({
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(store.submitResult({ runId, evidence, verified }), null, 2),
      },
    ],
  }),
);

server.registerTool(
  "update_task_column",
  {
    description: "Move task on Kanban and sync column to GitHub",
    inputSchema: {
      taskId: z.string(),
      column: z.enum(kanbanColumns),
    },
  },
  async ({ taskId, column }) => ({
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(await moveTaskColumn({ store, taskId, column }), null, 2),
      },
    ],
  }),
);

server.registerTool(
  "start_run",
  {
    description: "Delegate task to cursor or ollama adapter",
    inputSchema: {
      taskId: z.string(),
      specialist: z.enum(["product", "design", "dev", "qa", "research"]),
      adapter: z.enum(["cursor", "ollama"]),
      idempotencyKey: z.string(),
    },
  },
  async ({ taskId, specialist, adapter, idempotencyKey }) => {
    try {
      const result = store.startRun({
        taskId,
        specialist,
        adapter,
        model: null,
        idempotencyKey,
      });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "start_failed",
            }),
          },
        ],
      };
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
