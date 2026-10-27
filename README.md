# Flow Factory

Local-first software factory: GitHub tasks → specialized agents → verified outcomes.

## Prerequisites

- Node.js 24+
- pnpm 10+
- `gh` authenticated for GitHub (project scope: `gh auth refresh -s project`)
- Optional: [Ollama](https://ollama.com) and `agent login` for execution adapters

## Setup

```bash
pnpm install
npx skills add gaboesquivel/flow-skills --skill '*' -a cursor -y
pnpm factory    # http://127.0.0.1:3747
pnpm dev        # service + dashboard http://localhost:3750
```

CLI (from repo root after service is running):

```bash
node apps/cli/bin/flow-factory.mjs status
node apps/cli/bin/flow-factory.mjs configure gaboesquivel flow-factory
node apps/cli/bin/flow-factory.mjs sync
node apps/cli/bin/flow-factory.mjs task 'gaboesquivel/flow-factory#4'
node apps/cli/bin/flow-factory.mjs claim 'gaboesquivel/flow-factory#4' cursor
pnpm factory:mcp   # MCP stdio tools: list_tasks, get_task, sync_github
```

Bearer token: `.data/local.token` (created on first service start).

## Docs

[PRODUCT.md](PRODUCT.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [Spec 001](docs/specs/001-local-foreman-alpha.md)

## Alpha status

Foundation: service, SQLite, HTTP API, dashboard shell, CLI read paths. GitHub sync, MCP, delegation, and review ship in follow-up PRs.
