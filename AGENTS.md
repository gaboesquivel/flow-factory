# Agents

Short pointers for coding agents on branch **`simple`**.

## Current truth

| Document | Use |
| --- | --- |
| [PRODUCT.md](PRODUCT.md) | Agentic MCP/API-first starter scope |
| [DESIGN.md](DESIGN.md) | Porcelain studio layout |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Packages, commands, env, MCP/GenUI boundaries |
| [docs/adr/0001-use-flow-factory.md](docs/adr/0001-use-flow-factory.md) | Factory adoption |
| [docs/adr/0002-matt-workflow-on-simple.md](docs/adr/0002-matt-workflow-on-simple.md) | Matt workflow on `simple` |
| [docs/specs/001-lean-agentic-starter.md](docs/specs/001-lean-agentic-starter.md) | Starter requirements |

**Tracked work:** GitHub Issues (see [docs/simplified-flow-prd.md](docs/simplified-flow-prd.md)). No mandatory Flow phase router or custom Flow skill load for ordinary edits.

**Matt workflow:** Install and invoke skills per [README — Matt Pocock workflow](README.md#matt-pocock-workflow). Use native skill conventions; verify files on disk after `pnpm --dir .agents skills:install`.

## Flow commands

Flow's reusable commands are defined under
`.agents/flow/skills/` and exposed to Cursor through
`.cursor/commands/`.

| Command | Purpose |
| --- | --- |
| `/flow` | Spec → Tasks → Build → Review → Ship |
| `/f-council` | Independent decision review |
| `/f-retro` | Evidence-based workflow improvement |
| `/f-extract` | Extract reusable starter capabilities |
| `/f-yolo` | Test, commit, push, deploy, verify |

When invoked, read the corresponding canonical SKILL.md.

These commands are optional and do not replace the
existing Matt workflow for unrelated tasks.

Keep factory instructions under `.agents/flow/`.

For new consequential decisions made through Flow, use
numbered Decisions instead of creating new ADRs.
Preserve historical ADRs unless migration is explicitly
authorized.

Use the existing task report and prompt logging conventions.
Never claim a skill was loaded without reading its instructions.

## Product code

- `apps/web` — Next.js studio, MCP, GenUI API
- `packages/genui`, `packages/ui`, `packages/db`
- `agent/` — Eve tools (not duplicated business logic outside `@repo/genui`)

Factory stack ADRs live under `.agents/flow/decisions/` when touching inherited boundaries.

## Verification

Run checks that match the change; report commands and exit codes. UI changes: browser smoke via `pnpm test:browser` when routes change.

Optional Factory parity (Flow docs, eval harness, agents tooling): `pnpm ci:factory:local` or `pnpm --dir .agents check:factory`.
