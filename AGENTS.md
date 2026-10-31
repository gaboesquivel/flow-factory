# Agents

Flow Factory. Branch from `main`, open PRs to `main`; Conventional Commit titles (CI checks them).

| Document | Use |
| --- | --- |
| [PRODUCT.md](PRODUCT.md) | Product identity |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Eve / Foreman layout, models, Flow integration |
| [docs/specs/003-eve-foreman-rewrite.md](docs/specs/003-eve-foreman-rewrite.md) | Eve rewrite acceptance criteria |
| [docs/specs/004-baseline-run-metrics.md](docs/specs/004-baseline-run-metrics.md) | Run records and summary (`pnpm runs:*`) |
| [agent/skills/FLOW_SKILLS.md](agent/skills/FLOW_SKILLS.md) | Which upstream Flow Skills the stations adapt |
| [UPSTREAM.md](UPSTREAM.md) | Foreman upstream commit and attribution |

Read `node_modules/eve/docs/` before changing Eve integrations. Station pipeline and approval boundaries come from upstream Foreman unless a spec says otherwise. Factory PRs stay drafts; only a person marks them ready or merges.

**Verification:** while working, run only the focused test file (`node --import tsx --test tests/<file>.test.ts`). CI runs `pnpm validate` and `pnpm test` once per PR head; run them locally only before opening a PR. Evals call paid live models: run `pnpm eval:fast:local` or `pnpm eval:fast` only when asked, never in CI.

Do not touch `meta-cto` or derive implementation from it.
