# Agents

Flow Factory Alpha on branch `factory/*` → PRs to `main`.

| Document                                                                       | Use                  |
| ------------------------------------------------------------------------------ | -------------------- |
| [PRODUCT.md](PRODUCT.md)                                                       | Product identity     |
| [ARCHITECTURE.md](ARCHITECTURE.md)                                             | Technical boundaries |
| [docs/specs/001-local-foreman-alpha.md](docs/specs/001-local-foreman-alpha.md) | Alpha specification  |
| [docs/planning/002-post-alpha.md](docs/planning/002-post-alpha.md)             | Post-Alpha plan      |
| [docs/manual-alpha-checklist.md](docs/manual-alpha-checklist.md)               | Manual acceptance    |

Install Flow Skills: `npx skills add gaboesquivel/flow-skills --skill '*' -a cursor -y`

**Flow execution:** Spec 001 is complete; use [002-post-alpha](docs/planning/002-post-alpha.md) for next packages. Align `PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`, and specs when behavior changes (`implement` / `flow` skills).

**Verification:** `pnpm check-types`, `pnpm test`, `pnpm lint`; UI or route changes → `pnpm test:browser`.

Do not touch `meta-cto` or derive implementation from it.
