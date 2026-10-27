import Link from "next/link";

import type { RunRecord } from "@flow-factory/domain";

import { TaskActions } from "../../task-actions";
import { TaskRuns } from "../../task-runs";

const apiBase = process.env.FLOW_FACTORY_URL ?? "http://127.0.0.1:3747";

export default async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const taskId = decodeURIComponent(id);
  let payload: Record<string, unknown> | null = null;
  let error: string | null = null;

  try {
    const response = await fetch(`${apiBase}/v1/tasks/${encodeURIComponent(taskId)}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(String(response.status));
    payload = await response.json();
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "unavailable";
  }

  return (
    <main style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
      <p>
        <Link href="/">← Tasks</Link>
      </p>
      <h1>Task detail</h1>
      {error ? <p role="alert">Could not load task: {error}</p> : null}
      {payload ? (
        <>
          <TaskActions
            taskId={taskId}
            runId={
              payload.task && typeof payload.task === "object" && "runId" in payload.task
                ? (payload.task as { runId: string | null }).runId
                : null
            }
            runStatus={
              payload.task && typeof payload.task === "object" && "runStatus" in payload.task
                ? (payload.task as { runStatus: string | null }).runStatus
                : null
            }
          />
          <TaskRuns runs={Array.isArray(payload.runs) ? (payload.runs as RunRecord[]) : []} />
          <details style={{ marginTop: "1rem" }}>
            <summary>Raw task JSON</summary>
            <pre style={{ background: "#fff", padding: "1rem", borderRadius: 8, overflow: "auto" }}>
              {JSON.stringify(payload, null, 2)}
            </pre>
          </details>
        </>
      ) : null}
    </main>
  );
};
