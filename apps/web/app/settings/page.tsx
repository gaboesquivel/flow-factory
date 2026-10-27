import Link from "next/link";

const apiBase = process.env.FLOW_FACTORY_URL ?? "http://127.0.0.1:3747";

export default async () => {
  let config: unknown = null;
  let status: unknown = null;
  let error: string | null = null;

  try {
    const [configRes, statusRes] = await Promise.all([
      fetch(`${apiBase}/v1/github/config`, { cache: "no-store" }),
      fetch(`${apiBase}/v1/factory/status`, { cache: "no-store" }),
    ]);
    if (!configRes.ok || !statusRes.ok) throw new Error("service_error");
    config = await configRes.json();
    status = await statusRes.json();
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "unavailable";
  }

  return (
    <main style={{ padding: "1.5rem", maxWidth: 720, margin: "0 auto" }}>
      <p>
        <Link href="/">← Tasks</Link>
      </p>
      <h1>Settings</h1>
      <p style={{ color: "#626a65" }}>
        Read-only view of local factory connection. Configure GitHub with the CLI{" "}
        <code>configure</code> command.
      </p>
      {error ? <p role="alert">Service unavailable: {error}</p> : null}
      {config ? (
        <section style={{ marginTop: "1rem" }}>
          <h2>GitHub</h2>
          <pre style={{ background: "#fff", padding: "1rem", borderRadius: 8, overflow: "auto" }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        </section>
      ) : null}
      {status ? (
        <section style={{ marginTop: "1rem" }}>
          <h2>Factory</h2>
          <pre style={{ background: "#fff", padding: "1rem", borderRadius: 8, overflow: "auto" }}>
            {JSON.stringify(status, null, 2)}
          </pre>
        </section>
      ) : null}
    </main>
  );
};
