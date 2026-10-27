import Link from "next/link";

import type { FactoryStatus } from "@flow-factory/domain";

import { FactoryStatusPanel } from "../factory-status-panel";
import { SettingsForms } from "../settings-forms";

const apiBase = process.env.FLOW_FACTORY_URL ?? "http://127.0.0.1:3747";

type GithubConfig = {
  owner: string;
  repo: string;
  projectNumber: number | null;
  ownerType: string;
};

export default async () => {
  let config: GithubConfig | null = null;
  let status: FactoryStatus | null = null;
  let error: string | null = null;

  try {
    const [configRes, statusRes] = await Promise.all([
      fetch(`${apiBase}/v1/github/config`, { cache: "no-store" }),
      fetch(`${apiBase}/v1/factory/status`, { cache: "no-store" }),
    ]);
    if (!statusRes.ok) throw new Error("service_error");
    const configBody = await configRes.json();
    status = await statusRes.json();
    config = (configBody.config as GithubConfig | null) ?? null;
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "unavailable";
  }

  return (
    <main
      data-testid="settings-page"
      style={{ padding: "1.5rem", maxWidth: 720, margin: "0 auto" }}
    >
      <p>
        <Link href="/">← Tasks</Link>
      </p>
      <h1>Settings</h1>
      {error ? <p role="alert">Service unavailable: {error}</p> : null}
      {status ? (
        <div style={{ marginBottom: "1.5rem" }}>
          <FactoryStatusPanel status={status} />
        </div>
      ) : null}
      {status ? <SettingsForms config={config} status={status} /> : null}
    </main>
  );
};
