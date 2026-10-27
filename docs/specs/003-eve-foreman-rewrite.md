# Spec 003 — Eve / Foreman rewrite

**Status:** Complete (pending live draft-PR verification when connectors are configured)  
**Replaces:** Runtime described in [001-local-foreman-alpha.md](001-local-foreman-alpha.md) (historical alpha coordinator).

## Problem

The SQLite loopback coordinator duplicated Foreman's station pipeline and could not deliver isolated sandboxes, upstream safety evals, or Vercel-native GitHub Connect at parity with Vercel's template.

## Solution

Adopt Foreman on Eve as the runtime. Integrate Flow Skills as proportional judgment inside existing station instructions. Configure cost-conscious gateway models with optional local OpenAI-compatible profiles.

## Acceptance criteria

### Runtime

- [x] Repository builds with Eve (`pnpm validate` exit 0 with `FACTORY_REPO` + `GITHUB_CONNECTOR`).
- [x] Classifier → analyst → implementer → reviewer run via `run_*` tools; orchestrator does not implement features.
- [x] Implementer pushes a feature branch on `FACTORY_REPO`; reviewer uses a different model vendor family than implementer on gateway profile.
- [x] Unattended runs deliver **draft** PRs only; no autonomous merge or mark-ready.
- [x] Custom SQLite service, Kanban dashboard, CLI queue, and MCP task DB are removed.

### Flow

- [x] Skills `explore`, `to-spec`, `implement`, `review`, `flow` live under `agent/skills/` with provenance.
- [x] Stations reference Flow judgment; no mandatory spec or ceremony for trivial fixes.
- [x] Target repo `AGENTS.md` and product identity are not overwritten by Flow methodology.

### Models

- [x] `FACTORY_MODEL_PROFILE=gateway|local|hybrid` documented; Vercel deployments require gateway.
- [x] `pnpm models:check` probes local servers without substituting gateway models.

### Verification

- [x] `pnpm test` passes focused policy/model/instruction tests.
- [ ] `pnpm eval --tag fast` passes when eval environment is configured (requires AI Gateway `/login` or deployment credentials).
- [ ] Live labeled issue → draft PR exercised when scratch repo and connectors are available.

## Out of scope

- Custom dashboard, MCP task server, model router microservice, autonomous merge.
- Cursor Composer as implementer backend (future investigation only).
