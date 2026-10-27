# Flow Factory

Open-source software factory on [Eve](https://eve.dev) and [Foreman](https://github.com/vercel-labs/eve-software-factory-template): GitHub issue → classifier → analyst → implementer → independent reviewer → **draft** pull request on your repository.

Flow Skills provide product-engineering discipline inside each station without a second workflow engine.

Upstream baseline: [UPSTREAM.md](UPSTREAM.md).

## Prerequisites

- Node.js 24+
- pnpm 10+
- Vercel project linked for deployment (or local `eve dev`)
- `FACTORY_REPO` — existing GitHub repository the factory works on
- `GITHUB_CONNECTOR` — Vercel Connect GitHub connector UID

## Setup

```bash
pnpm install
cp .env.example .env   # edit FACTORY_REPO and connectors
vercel link            # when deploying or pulling env
vercel env pull        # optional: sync connector UIDs
pnpm validate
pnpm dev               # Eve TUI
```

### GitHub-only

`GITHUB_CONNECTOR` and `FACTORY_REPO` are required. `LINEAR_CONNECTOR` is optional.

### Linear (optional)

1. Set `LINEAR_CONNECTOR` in the environment.
2. Copy [docs/linear-channel.example.ts](docs/linear-channel.example.ts) to `agent/channels/linear.ts`.
3. Re-run `pnpm validate`.

## Model configuration

| Profile | Env | Use |
| --- | --- | --- |
| `gateway` | `FACTORY_MODEL_PROFILE=gateway` (default) | Vercel AI Gateway models (required on Vercel) |
| `local` | `FACTORY_MODEL_PROFILE=local` + `FACTORY_LOCAL_BASE_URL` + `FACTORY_LOCAL_MODEL_*` | Ollama, LM Studio, or other OpenAI-compatible servers |
| `hybrid` | `FACTORY_MODEL_PROFILE=hybrid` | Local orchestrator/classifier; gateway for other stations |

Probe local models: `pnpm models:check` (no-op for gateway profile).

Gateway defaults (see [agent/lib/model-policy.ts](agent/lib/model-policy.ts)):

- Orchestrator, classifier, analyst, researcher: `deepseek/deepseek-v4.1-flash-1017`
- Implementer: `deepseek/deepseek-v4-pro`
- Reviewer: `zai/glm-5.3-flash` (different vendor family from implementer)

## Operating the factory

1. Install the GitHub App behind `GITHUB_CONNECTOR` on `FACTORY_REPO`.
2. Label an issue with `factory` (or the value of `FACTORY_LABEL`) or @mention the bot from a trusted collaborator.
3. Watch station progress on the issue; receive a draft PR when review approves.
4. Mark the PR ready and merge as a human.

## Verification

```bash
FACTORY_REPO=owner/repo GITHUB_CONNECTOR=github/your-connector pnpm validate
pnpm test
pnpm eval --tag fast    # requires eval credentials per Foreman docs
```

## Docs

[PRODUCT.md](PRODUCT.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [Spec 003](docs/specs/003-eve-foreman-rewrite.md)

Historical: [Spec 001](docs/specs/001-local-foreman-alpha.md) (pre-Eve alpha), [Spec 002](docs/specs/002-beta-dashboard-ops.md).
