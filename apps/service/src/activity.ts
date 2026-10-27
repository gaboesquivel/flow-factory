import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

export const logActivity = ({
  db,
  taskId,
  kind,
  payload,
}: {
  db: DatabaseSync;
  taskId: string;
  kind: string;
  payload: Record<string, unknown>;
}) => {
  db.prepare(
    "INSERT INTO activity (id, task_id, kind, payload, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(randomUUID(), taskId, kind, JSON.stringify(payload), new Date().toISOString());
};

export const listActivity = (db: DatabaseSync, taskId: string) => {
  const rows = db
    .prepare(
      "SELECT kind, payload, created_at FROM activity WHERE task_id = ? ORDER BY created_at DESC LIMIT 50",
    )
    .all(taskId) as { kind: string; payload: string; created_at: string }[];

  return rows.map((row) => ({
    kind: row.kind,
    createdAt: row.created_at,
    payload: JSON.parse(row.payload) as Record<string, unknown>,
  }));
};
