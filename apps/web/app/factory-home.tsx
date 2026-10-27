import type { KanbanColumn } from "@flow-factory/domain";

import { KanbanBoard } from "./kanban-board";

type Props = {
  status: Record<string, unknown> | null;
  tasks: unknown[];
  error: string | null;
};

type TaskCard = {
  id: string;
  title: string;
  column: KanbanColumn;
  blocked: boolean;
  runStatus: string | null;
  syncError: string | null;
};

export const FactoryHome = ({ status, tasks, error }: Props) => {
  const typedTasks = tasks as TaskCard[];

  return (
    <main style={{ padding: "1.5rem", maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0 }}>Flow Factory</h1>
        <p style={{ color: "#626a65" }}>
          GitHub-backed tasks, local service, shared state across dashboard, CLI, and MCP.
        </p>
      </header>

      {error ? (
        <p role="alert" style={{ padding: "1rem", border: "1px solid #7d867f", borderRadius: 8 }}>
          Local service unavailable: {error}. Run <code>pnpm factory</code> from the repository
          root.
        </p>
      ) : null}

      {status ? (
        <section aria-label="Factory status" style={{ marginBottom: "1.5rem" }}>
          <h2>Status</h2>
          <pre style={{ background: "#fff", padding: "1rem", borderRadius: 8, overflow: "auto" }}>
            {JSON.stringify(status, null, 2)}
          </pre>
        </section>
      ) : null}

      <section aria-label="Task board">
        <h2>Tasks</h2>
        {typedTasks.length === 0 ? (
          <p>No tasks yet. Connect GitHub in a later increment or create a task via the API.</p>
        ) : (
          <KanbanBoard tasks={typedTasks} />
        )}
      </section>
    </main>
  );
};
