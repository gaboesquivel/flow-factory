# Agents

Flow Factory. Branch from `main`, open PRs to `main`; Conventional Commit titles (CI checks them).

| Document                                                                         | Use                                                 |
| -------------------------------------------------------------------------------- | --------------------------------------------------- |
| [PRODUCT.md](PRODUCT.md)                                                         | Product identity                                    |
| [ARCHITECTURE.md](ARCHITECTURE.md)                                               | Eve / Foreman layout, models, Flow integration      |
| [docs/specs/003-eve-foreman-rewrite.md](docs/specs/003-eve-foreman-rewrite.md)   | Eve rewrite acceptance criteria                     |
| [docs/specs/004-baseline-run-metrics.md](docs/specs/004-baseline-run-metrics.md) | Run records and summary (`pnpm runs:*`)             |
| [docs/agent-skills.md](docs/agent-skills.md)                                     | Development skill installation and runtime boundary |
| [agent/skills/FLOW_SKILLS.md](agent/skills/FLOW_SKILLS.md)                       | Which upstream Flow Skills the stations adapt       |
| [UPSTREAM.md](UPSTREAM.md)                                                       | Foreman upstream commit and attribution             |

Read `node_modules/eve/docs/` before changing Eve integrations. Station pipeline and approval boundaries come from upstream Foreman unless a spec says otherwise. Factory PRs stay drafts; only a person marks them ready or merges.

**Verification:** while working, run only the focused test file (`node --import tsx --test tests/<file>.test.ts`). CI runs `pnpm validate` and `pnpm test` once per PR head; run them locally only before opening a PR. Evals call paid live models: run `pnpm eval:fast:local` or `pnpm eval:fast` only when asked, never in CI.

Do not touch `meta-cto` or derive implementation from it.

<!-- BEGIN FLOW -->

## Flow

This project uses Flow skills: say a phrase below to load its skill. The installed `flow` skill owns this block; delete it to opt out.

Do the work yourself: CLI, then MCP, then API, then browser. Hand the user only sign-in, secrets, payment, consent, or permission changes, once, as one command each (`write-agents` Tools).

Before merge, a second agent reviews the diff in a fresh context, with effort matched to risk; every finding is fixed or answered. CI, Git hook, auth, billing, and release changes ship only on the user's yes.

| Say                                                  | Skill       |
| ---------------------------------------------------- | ----------- |
| "explore this"                                       | `explore`   |
| "interview me"                                       | `interview` |
| "grill this"                                         | `grill`     |
| "spec it"                                            | `to-spec`   |
| "share the draft"                                    | `to-spec`   |
| "break it down"                                      | `to-tasks`  |
| "build it"                                           | `build`     |
| "check it against the spec"                          | `review`    |
| "ship it" (add "local" or "with GitHub" for one run) | `ship`      |
| "push it"                                            | `push`      |
| "update the docs"                                    | `flow`      |

<!-- END FLOW -->
