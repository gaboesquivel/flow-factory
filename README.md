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
node apps/cli/bin/flow-factory.mjs move 'gaboesquivel/flow-factory#4' in_progress
node apps/cli/bin/flow-factory.mjs task 'gaboesquivel/flow-factory#4'
node apps/cli/bin/flow-factory.mjs claim 'gaboesquivel/flow-factory#4' cursor
pnpm factory:mcp   # MCP: list/get tasks, sync, claim/release, handoff, start_run, submit_result
```

Bearer token: `.data/local.token` (created on first service start).

## Docs

[PRODUCT.md](PRODUCT.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [Spec 001](docs/specs/001-local-foreman-alpha.md)

## Alpha status

See [docs/manual-alpha-checklist.md](docs/manual-alpha-checklist.md). GitHub sync, MCP, claims, handoffs, run queue, worktrees, and authorized draft PR API are on `main`. Cursor/Ollama and Projects V2 require local tooling setup; failures stay visible.
