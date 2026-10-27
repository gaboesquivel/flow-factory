# Agents

Flow Factory on branch `factory/eve-rewrite` → PRs to `main`.

| Document | Use |
| --- | --- |
| [PRODUCT.md](PRODUCT.md) | Product identity |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Eve / Foreman layout, models, Flow integration |
| [docs/specs/003-eve-foreman-rewrite.md](docs/specs/003-eve-foreman-rewrite.md) | Current rewrite acceptance criteria |
| [UPSTREAM.md](UPSTREAM.md) | Foreman upstream commit and attribution |

Read `node_modules/eve/docs/` before changing Eve integrations. Station pipeline and approval boundaries come from upstream Foreman unless spec 003 says otherwise.

**Verification:** `FACTORY_REPO` and `GITHUB_CONNECTOR` set → `pnpm validate`, `pnpm test`, `pnpm eval --tag fast` when eval env is available.

Do not touch `meta-cto` or derive implementation from it.
