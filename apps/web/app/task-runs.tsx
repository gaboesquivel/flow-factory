import type { RunRecord } from "@flow-factory/domain";

type Props = { runs: RunRecord[] };

export const TaskRuns = ({ runs }: Props) => {
  if (!runs.length) return null;

  return (
    <section aria-label="Runs" data-testid="task-runs" style={{ marginTop: "1rem" }}>
      <h2>Runs</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {runs.map((run) => (
          <li
            key={run.id}
            style={{
              background: "#fff",
              border: "1px solid #7d867f",
              borderRadius: 8,
              padding: "0.75rem",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            <div>
              <strong>{run.status}</strong> · {run.adapter} / {run.specialist}
            </div>
            <div style={{ color: "#626a65" }}>{run.id}</div>
            {run.branchName ? <div>Branch: {run.branchName}</div> : null}
            {run.error ? (
              <div role="alert" style={{ color: "#8b1e1e" }}>
                {run.error}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
};
