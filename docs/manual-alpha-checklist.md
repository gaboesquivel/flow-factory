# Flow Factory Alpha — manual checklist

1. `pnpm install && pnpm factory` — service on `127.0.0.1:3747`, token in `.data/local.token`.
2. `pnpm dev` — dashboard on port 3750.
3. `gh auth status` — GitHub connected; optional `gh auth refresh -s project` for Projects V2 columns.
4. `node apps/cli/bin/flow-factory.mjs configure gaboesquivel flow-factory [projectNumber]`
5. `node apps/cli/bin/flow-factory.mjs sync` — real issues appear on the board.
6. Open a task → **Work here**, **Save handoff**, reload — handoff persists in JSON detail.
7. `agent login` — then **Delegate (Cursor)**; observe run status on task (may fail honestly if not logged in).
8. MCP: `pnpm factory:mcp` — call `list_tasks` / `get_task` from a compatible client.
9. After a completed Cursor run with worktree changes, use **Authorize draft PR** on the task page (or POST `/v1/reviews/draft-pr` with `humanAuthorized: true`).
10. **Discard worktree** removes the local worktree after review; failed/cancelled runs clean up automatically.
11. MCP tools: `list_tasks`, `get_task`, `sync_github`, `claim_task`, `release_task`, `save_handoff`, `start_run`, `submit_result`.
12. Drag a card on the home Kanban or use **Move to…** on the task page — syncs Projects V2 **Status** (auto-adds issue to project when missing), else `factory-column:*` labels.
13. Restart the service — orphan folders under `.data/worktrees/` without a DB worktree row are removed on startup.
