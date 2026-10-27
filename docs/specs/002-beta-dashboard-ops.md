# 002 — Beta dashboard operations

> **Historical:** Describes the removed Kanban dashboard; current operator UI is GitHub + Eve dev TUI ([003](003-eve-foreman-rewrite.md)).

**Status:** Complete  
**Owner:** Flow Factory  
**Builds on:** [001 — Local Foreman Alpha](001-local-foreman-alpha.md)

## Problem

Alpha required CLI for GitHub configuration and had no dashboard control for factory pause.

## Solution

Settings page supports GitHub `configure` and factory pause/resume through existing service APIs.

## Acceptance

1. User can set owner, repo, and optional project number from `/settings` and sync from home.
2. User can pause and resume the factory from `/settings`; status panel reflects paused state.
3. `pnpm test:browser` still passes.

## Out of scope

Multi-user auth, hosted config, editing `statusFieldMap` in UI.
