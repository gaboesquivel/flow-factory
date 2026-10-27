import type { KanbanColumn } from "@flow-factory/domain";

import { KanbanBoard } from "./kanban-board";
import { FactoryToolbar } from "./factory-toolbar";

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
        {!error ? (
          <div style={{ marginTop: "0.75rem" }}>
            <FactoryToolbar />
          </div>
        ) : null}
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
          <p>No tasks yet. Configure GitHub with the CLI, then use Sync GitHub above.</p>
        ) : null}
        {typedTasks.length > 0 ? <KanbanBoard tasks={typedTasks} /> : null}
      </section>
    </main>
  );
};
