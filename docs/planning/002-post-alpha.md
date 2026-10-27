# 002 — Post-Alpha execution plan

**Status:** Active  
**Depends on:** [Spec 001 — Local Foreman Alpha](../specs/001-local-foreman-alpha.md) (complete on `main`)

## Goal

Harden the local factory for daily use: CI parity, issue-backed backlog, and small UX gaps—without cloud hosting or multi-repo orchestration.

## Work packages

| ID   | Package              | Outcome                                                       |
| ---- | -------------------- | ------------------------------------------------------------- |
| P2.1 | CI on `main`         | `check-types`, `test`, `test:browser` in GitHub Actions       |
| P2.2 | Issue-backed backlog | Track Beta items as `gaboesquivel/flow-factory` issues        |
| P2.3 | Dashboard polish     | Settings (GitHub config), run list, release claim from UI     |
| P2.4 | MCP parity           | `update_task_column`, handoff read paths documented in README |
| P2.5 | Release              | Tag `v0.1.0-alpha` after CI green                             |

## Verification (Flow)

- Unit: `pnpm test`
- Types: `pnpm check-types`
- UI routes: `pnpm test:browser`
- Manual: [manual-alpha-checklist.md](../manual-alpha-checklist.md)

## Out of scope

Hosted factory, Postgres/Redis, Linear, autonomous merge.
