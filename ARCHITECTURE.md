# Architecture

```text
Dashboard (Next.js) ──┐
CLI (flow-factory)  ──┼──► Loopback HTTP service ──► SQLite
MCP (stdio)         ──┘              │
                                     ├── GitHub Issues / Projects (read + column write-back)
                                     ├── Cursor CLI adapter (git worktrees per run)
                                     └── Ollama adapter
```

| Path              | Role                                                  |
| ----------------- | ----------------------------------------------------- |
| `apps/service`    | Authoritative state, API, queue, Foreman coordination |
| `apps/web`        | Task board and factory status                         |
| `apps/cli`        | Thin client over the same API                         |
| `packages/domain` | Shared types and run transition rules                 |

Service defaults: `127.0.0.1:3747`, data under `.data/`, bearer token in `.data/local.token`.

Environment (optional):

| Variable                  | Purpose                              |
| ------------------------- | ------------------------------------ |
| `FLOW_FACTORY_DATA_DIR`   | SQLite and token directory           |
| `FLOW_FACTORY_URL`        | Dashboard / CLI API base             |
| `FLOW_FACTORY_TOKEN_PATH` | Bearer token file for server actions |

Commands:

```bash
pnpm install
pnpm factory          # start service
pnpm dev              # service + dashboard
pnpm test
pnpm test:browser     # Playwright (starts service + web)
pnpm factory:mcp      # MCP stdio tools
```

Planning and specs live under `docs/specs/` and `docs/planning/`. Alpha contract: [001-local-foreman-alpha.md](docs/specs/001-local-foreman-alpha.md).
