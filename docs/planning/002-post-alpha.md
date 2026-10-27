# 002 — Post-Alpha execution plan

**Status:** Active  
**Depends on:** [Spec 001 — Local Foreman Alpha](../specs/001-local-foreman-alpha.md) (complete on `main`)

## Goal

Harden the local factory for daily use: CI parity, issue-backed backlog, and small UX gaps—without cloud hosting or multi-repo orchestration.

## Work packages

| ID   | Package              | Outcome                                                     |
| ---- | -------------------- | ----------------------------------------------------------- |
| P2.1 | CI on `main`         | Done — `.github/workflows/ci.yml`                           |
| P2.2 | Issue-backed backlog | Open GitHub issues for P2.3–P2.5                            |
| P2.3 | Dashboard polish     | Done — `/settings`, task runs list, release claim on detail |
| P2.4 | MCP parity           | Done — `update_task_column`; document handoff in README     |
| P2.5 | Release              | Tag `v0.1.0-alpha` after CI green                           |

## Verification (Flow)

- Unit: `pnpm test`
- Types: `pnpm check-types`
- UI routes: `pnpm test:browser`
- Manual: [manual-alpha-checklist.md](../manual-alpha-checklist.md)

## Out of scope

Hosted factory, Postgres/Redis, Linear, autonomous merge.
