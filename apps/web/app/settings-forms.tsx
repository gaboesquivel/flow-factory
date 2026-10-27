"use client";

import { useState } from "react";

import type { FactoryStatus } from "@flow-factory/domain";

import { configureGithubAction, pauseFactoryAction, resumeFactoryAction } from "./settings-actions";

type GithubConfig = {
  owner: string;
  repo: string;
  projectNumber: number | null;
  ownerType: string;
};

type Props = {
  config: GithubConfig | null;
  status: FactoryStatus;
};

export const SettingsForms = ({ config, status }: Props) => {
  const [message, setMessage] = useState<string | null>(null);
  const [owner, setOwner] = useState(config?.owner ?? "");
  const [repo, setRepo] = useState(config?.repo ?? "");
  const [projectNumber, setProjectNumber] = useState(
    config?.projectNumber ? String(config.projectNumber) : "",
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <section aria-label="GitHub configuration" data-testid="settings-github">
        <h2>GitHub repository</h2>
        <p style={{ color: "#626a65", fontSize: "0.9rem" }}>
          Same as CLI <code>configure owner repo [project#]</code>. Requires <code>gh</code> auth on
          this machine.
        </p>
        <form
          style={{ display: "grid", gap: "0.5rem", maxWidth: 360, marginTop: "0.75rem" }}
          onSubmit={async (event) => {
            event.preventDefault();
            const result = await configureGithubAction({ owner, repo, projectNumber });
            setMessage(
              result.ok
                ? "GitHub configuration saved"
                : `Configure failed: ${JSON.stringify(result.json)}`,
            );
          }}
        >
          <label>
            Owner
            <input
              required
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
            />
          </label>
          <label>
            Repository
            <input
              required
              value={repo}
              onChange={(event) => setRepo(event.target.value)}
              style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
            />
          </label>
          <label>
            Project number (optional)
            <input
              value={projectNumber}
              onChange={(event) => setProjectNumber(event.target.value)}
              inputMode="numeric"
              style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
            />
          </label>
          <button type="submit">Save GitHub config</button>
        </form>
      </section>

      <section aria-label="Factory control" data-testid="settings-factory">
        <h2>Factory control</h2>
        <p style={{ color: "#626a65", fontSize: "0.9rem" }}>
          Paused factories reject new runs until resumed.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            disabled={status.paused}
            data-testid="factory-pause"
            onClick={async () => {
              const result = await pauseFactoryAction();
              setMessage(result.ok ? "Factory paused" : JSON.stringify(result.json));
            }}
          >
            Pause
          </button>
          <button
            type="button"
            disabled={!status.paused}
            data-testid="factory-resume"
            onClick={async () => {
              const result = await resumeFactoryAction();
              setMessage(result.ok ? "Factory resumed" : JSON.stringify(result.json));
            }}
          >
            Resume
          </button>
        </div>
      </section>

      {message ? <p role="status">{message}</p> : null}
    </div>
  );
};
