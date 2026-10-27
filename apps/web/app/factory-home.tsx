import { kanbanColumns, type KanbanColumn } from "@flow-factory/domain";

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

const columnLabel: Record<KanbanColumn, string> = {
  backlog: "Backlog",
  ready: "Ready",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

export const FactoryHome = ({ status, tasks, error }: Props) => {
  const typedTasks = tasks as TaskCard[];
  const byColumn = kanbanColumns.map((column) => ({
    column,
    tasks: typedTasks.filter((task) => task.column === column),
  }));

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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${kanbanColumns.length}, minmax(0, 1fr))`,
              gap: "0.75rem",
            }}
          >
            {byColumn.map(({ column, tasks: columnTasks }) => (
              <div key={column}>
                <h3 style={{ fontSize: "0.9rem" }}>{columnLabel[column]}</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {columnTasks.map((task) => (
                    <li
                      key={task.id}
                      style={{
                        background: "#fff",
                        border: "1px solid #7d867f",
                        borderRadius: 8,
                        padding: "0.75rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <strong>{task.title}</strong>
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
        )}
      </section>
    </main>
  );
};
