import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { join } from "node:path";
import { z } from "zod";

import { openDatabase } from "./db.js";
import { createStore } from "./store.js";
import { resolveDbPath } from "./config.js";

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

const transport = new StdioServerTransport();
await server.connect(transport);
