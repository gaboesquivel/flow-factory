"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { syncGithub } from "./actions";

export const FactoryToolbar = () => {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setMessage(null);
          const result = await syncGithub();
          setMessage(
            result.ok
              ? `Synced ${result.json.count ?? "?"} issues from GitHub`
              : `Sync failed: ${JSON.stringify(result.json)}`,
          );
          setBusy(false);
          router.refresh();
        }}
      >
        {busy ? "Syncing…" : "Sync GitHub"}
      </button>
      {message ? <span role="status">{message}</span> : null}
    </div>
  );
};
