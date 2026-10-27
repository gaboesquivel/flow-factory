# 001 — Local Foreman Alpha

**Status:** Alpha complete (local verification; adapters depend on host tooling)  
**Owner:** Flow Factory

## Problem Statement

Individual developers repeatedly explain context to agents, copy tasks between tools, and lack durable evidence for runs, claims, and reviews.

## Solution

A local Flow Factory: GitHub Issues as tasks, a loopback service with SQLite, dashboard + CLI + MCP sharing one API, Foreman coordination, and verified execution adapters.

## User Stories

1. As a developer, I connect a repo and project and see real issues on a Kanban board.
2. As a developer, I claim a task, save a handoff, and resume from another client.
3. As a developer, I delegate to Cursor or Ollama when available and inspect honest run evidence.
4. As a developer, I review changes and authorize a draft PR without automatic merge.

## Implementation Decisions

- **Service-first:** All mutations go through `apps/service`; clients are thin.
- **Identity:** `owner/repo#issue` only; no local shadow backlog.
- **Adapters:** Probed at runtime; blocked adapters stay visible.
- **Runs:** Idempotent `start_run`; terminal states cannot be overwritten by late success.

## Testing Decisions

- `node:test` on domain transitions, store idempotency, and concurrent claims.
- Integration tests expand in PRs 2–5 (GitHub sync, restart, cancellation).

## Out of Scope (Alpha)

Cloud hosting, Linear, multi-repo orchestration, MLX, autonomous merge, billing, Redis/Postgres orchestration.

## F01–F20 (brief)

| ID  | Requirement                         | Alpha                |
| --- | ----------------------------------- | -------------------- |
| F01 | GitHub Issues as sole task identity | Alpha                |
| F02 | Projects V2 Kanban mapping          | Alpha (PR2)          |
| F03 | Local loopback service              | Alpha                |
| F04 | SQLite durability                   | Alpha                |
| F05 | Shared API / CLI / MCP              | Alpha                |
| F06 | Exclusive task reservations         | Alpha (PR3)          |
| F07 | Handoffs                            | Alpha (PR3)          |
| F08 | Run coordinator                     | Alpha (PR4)          |
| F09 | Cursor adapter                      | Alpha when logged in |
| F10 | Ollama adapter                      | Alpha when installed |
| F11 | Worktree isolation                  | Alpha (PR4)          |
| F12 | Independent review pass             | Alpha (PR5)          |
| F13 | Draft PR with human approval        | Alpha (PR5)          |
| F14 | Pause factory                       | Alpha                |
| F15 | Cancellation terminal               | Alpha (PR4)          |
| F16 | Restart recovery                    | Alpha (PR4)          |
| F17 | No fabricated runs                  | Alpha                |
| F18 | Flow Skills methodology             | Alpha                |
| F19 | Failure-path tests                  | Alpha (PR5)          |
| F20 | README reproduction                 | Alpha (PR5)          |
