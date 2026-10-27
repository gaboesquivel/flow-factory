"use client";

import { useState } from "react";

import {
  claimTask,
  discardWorktreeAction,
  draftPrAction,
  saveHandoffAction,
  startRunAction,
  syncGithub,
} from "./actions";

type Props = {
  taskId: string;
  runId: string | null;
  runStatus: string | null;
};

const reviewableRun = (status: string | null) =>
  status === "completed" || status === "awaiting_intervention";

export const TaskActions = ({ taskId, runId, runStatus }: Props) => {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section aria-label="Task actions" style={{ marginTop: "1rem" }}>
      <h2>Actions</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={async () => {
            const result = await claimTask({ taskId, holder: "dashboard" });
            setMessage(result.ok ? "Claimed" : JSON.stringify(result.json));
          }}
        >
          Work here
        </button>
        <button
          type="button"
          onClick={async () => {
            const result = await saveHandoffAction({
              taskId,
              summary: "Continuity checkpoint",
              nextAction: "Resume implementation",
              context: "Saved from dashboard",
            });
            setMessage(result.ok ? "Handoff saved" : JSON.stringify(result.json));
          }}
        >
          Save handoff
        </button>
        <button
          type="button"
          onClick={async () => {
            const result = await startRunAction({
              taskId,
              specialist: "dev",
              adapter: "cursor",
            });
            setMessage(result.ok ? `Run ${result.json.run?.id}` : JSON.stringify(result.json));
          }}
        >
          Delegate (Cursor)
        </button>
        <button
          type="button"
          onClick={async () => {
            const result = await syncGithub();
            setMessage(result.ok ? "GitHub synced" : JSON.stringify(result.json));
          }}
        >
          Sync GitHub
        </button>
        {runId && reviewableRun(runStatus) ? (
          <button
            type="button"
            onClick={async () => {
              const result = await draftPrAction({
                runId,
                evidence: "Authorized from Flow Factory dashboard",
              });
              setMessage(
                result.ok
                  ? `Draft PR: ${result.json.draftPrUrl ?? "created"}`
                  : JSON.stringify(result.json),
              );
            }}
          >
            Authorize draft PR
          </button>
        ) : null}
        {runId && reviewableRun(runStatus) ? (
          <button
            type="button"
            onClick={async () => {
              const result = await discardWorktreeAction({ runId });
              setMessage(result.ok ? "Worktree discarded" : JSON.stringify(result.json));
            }}
          >
            Discard worktree
          </button>
        ) : null}
      </div>
      {message ? <p role="status">{message}</p> : null}
    </section>
  );
};
