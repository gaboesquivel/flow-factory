import type { FactoryStatus } from "@flow-factory/domain";

const dot = (ok: boolean) => (ok ? "●" : "○");

export const FactoryStatusPanel = ({ status }: { status: FactoryStatus }) => (
  <section
    aria-label="Factory status"
    data-testid="factory-status"
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "1rem 1.5rem",
      padding: "0.75rem 1rem",
      background: "#fff",
      border: "1px solid #7d867f",
      borderRadius: 8,
      fontSize: "0.9rem",
    }}
  >
    <span>
      {dot(!status.paused)} Factory {status.paused ? "paused" : "running"}
    </span>
    <span>
      {dot(status.github.connected)} GitHub{" "}
      {status.github.connected ? "connected" : status.github.error?.trim() || "not configured"}
    </span>
    <span>
      {dot(status.adapters.cursor.available)} Cursor{" "}
      {status.adapters.cursor.available
        ? "ready"
        : (status.adapters.cursor.reason ?? "unavailable")}
    </span>
    <span>
      {dot(status.adapters.ollama.available)} Ollama{" "}
      {status.adapters.ollama.available
        ? "ready"
        : (status.adapters.ollama.reason ?? "unavailable")}
    </span>
  </section>
);
