# Architecture

```text
Dashboard (Next.js) ──┐
CLI (flow-factory)  ──┼──► Loopback HTTP service ──► SQLite
MCP (planned)       ──┘              │
                                     ├── GitHub Issues / Projects
                                     ├── Cursor CLI adapter
                                     └── Ollama adapter
```

| Path              | Role                                                  |
| ----------------- | ----------------------------------------------------- |
| `apps/service`    | Authoritative state, API, queue, Foreman coordination |
| `apps/web`        | Task board and factory status                         |
| `apps/cli`        | Thin client over the same API                         |
| `packages/domain` | Shared types and run transition rules                 |

Service defaults: `127.0.0.1:3747`, data under `.data/`, bearer token in `.data/local.token`.

Commands:

```bash
pnpm install
pnpm factory          # start service
pnpm dev              # service + dashboard
pnpm test
```
