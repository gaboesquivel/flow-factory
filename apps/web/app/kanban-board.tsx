"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { kanbanColumns, type KanbanColumn } from "@flow-factory/domain";

import { moveTaskColumn } from "./actions";

type TaskCard = {
  id: string;
  title: string;
  column: KanbanColumn;
  blocked: boolean;
  runStatus: string | null;
  syncError: string | null;
};

const columnLabel: Record<KanbanColumn, string> = {
  backlog: "Backlog",
  ready: "Ready",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

export const KanbanBoard = ({ tasks }: { tasks: TaskCard[] }) => {
  const router = useRouter();
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const byColumn = kanbanColumns.map((column) => ({
    column,
    tasks: tasks.filter((task) => task.column === column),
  }));

  const dropOnColumn = async (column: KanbanColumn) => {
    if (!dragTaskId) return;
    const task = tasks.find((item) => item.id === dragTaskId);
    if (!task || task.column === column) {
      setDragTaskId(null);
      return;
    }
    const result = await moveTaskColumn({ taskId: dragTaskId, column });
    setMessage(
      result.ok ? `Moved to ${columnLabel[column]}` : `Move failed: ${JSON.stringify(result.json)}`,
    );
    setDragTaskId(null);
    router.refresh();
  };

  return (
    <>
      {message ? <p role="status">{message}</p> : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${kanbanColumns.length}, minmax(0, 1fr))`,
          gap: "0.75rem",
        }}
      >
        {byColumn.map(({ column, tasks: columnTasks }) => (
          <div
            key={column}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={() => void dropOnColumn(column)}
            style={{
              minHeight: 120,
              padding: "0.25rem",
              borderRadius: 8,
              outline: dragTaskId ? "1px dashed #7d867f" : undefined,
            }}
          >
            <h3 style={{ fontSize: "0.9rem" }}>{columnLabel[column]}</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {columnTasks.map((task) => (
                <li
                  key={task.id}
                  draggable
                  onDragStart={() => setDragTaskId(task.id)}
                  onDragEnd={() => setDragTaskId(null)}
                  style={{
                    background: "#fff",
                    border: "1px solid #7d867f",
                    borderRadius: 8,
                    padding: "0.75rem",
                    marginBottom: "0.5rem",
                    cursor: "grab",
                  }}
                >
                  <strong>
                    <Link href={`/tasks/${encodeURIComponent(task.id)}`}>{task.title}</Link>
                  </strong>
                  <div style={{ fontSize: "0.85rem", color: "#626a65" }}>{task.id}</div>
                  {task.blocked ? <div aria-label="Blocked">Blocked</div> : null}
                  {task.runStatus ? <div>Run: {task.runStatus}</div> : null}
                  {task.syncError ? (
                    <div role="alert" style={{ color: "#8b1e1e" }}>
                      {task.syncError}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
};
