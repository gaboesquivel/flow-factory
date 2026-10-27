# Flow Factory Alpha — manual checklist

1. `pnpm install && pnpm factory` — service on `127.0.0.1:3747`, token in `.data/local.token`.
2. `pnpm dev` — dashboard on port 3750.
3. `gh auth status` — GitHub connected; optional `gh auth refresh -s project` for Projects V2 columns.
4. `node apps/cli/bin/flow-factory.mjs configure gaboesquivel flow-factory [projectNumber]`
5. `node apps/cli/bin/flow-factory.mjs sync` — real issues appear on the board.
6. Open a task → **Work here**, **Save handoff**, reload — handoff persists in JSON detail.
7. `agent login` — then **Delegate (Cursor)**; observe run status on task (may fail honestly if not logged in).
8. MCP: `pnpm factory:mcp` — call `list_tasks` / `get_task` from a compatible client.
9. After a completed Cursor run with worktree changes, POST `/v1/reviews/draft-pr` with `humanAuthorized: true` to open a draft PR (requires pushed branch and changes).
