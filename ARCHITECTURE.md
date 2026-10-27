# Architecture

Flow Factory is an [Eve](https://eve.dev) agent derived from [Foreman](https://github.com/vercel-labs/eve-software-factory-template) (see [UPSTREAM.md](UPSTREAM.md)).

```text
GitHub issue (label / @mention)
        │
        ▼
Orchestrator (Flow Factory instructions)
        │
        ├── run_classifier
        ├── run_analyst      (sandbox: clone FACTORY_REPO)
        ├── run_implementer  (isolated checkout, push branch)
        └── run_reviewer     (independent model family, real diff)
        │
        ▼
Draft PR on FACTORY_REPO (human marks ready / merges)
```

| Path | Role |
| --- | --- |
| [agent/](agent/) | Eve agent: channels, stations, tools, skills, sandboxes |
| [agent/lib/models.ts](agent/lib/models.ts) | Per-station models (`gateway` / `local` / `hybrid`) |
| [agent/lib/github/](agent/lib/github/) | GitHub extension context, sandboxes, approval policies |
| [evals/](evals/) | Foreman routing and safety evals |

## Target repository

`FACTORY_REPO` (`owner/repo`) is the only repository station sandboxes clone and push to. The factory repository itself is not modified unless it is explicitly configured as the target.

## Flow integration

Flow Skills live under [agent/skills/](agent/skills/) (`explore`, `to-spec`, `implement`, `review`, `flow`). Station `instructions.md` files tell agents when to load them. There is no second workflow router and no mandatory spec for trivial fixes.

## Models

`FACTORY_MODEL_PROFILE` selects static per-station configuration:

- **gateway** (default, required on Vercel): DeepSeek flash for orchestration/classifier/analyst/researcher, DeepSeek Pro for implementer, GLM 5.3 Flash for reviewer.
- **local**: OpenAI-compatible endpoint via `FACTORY_LOCAL_BASE_URL` and per-station `FACTORY_LOCAL_MODEL_*` env vars.
- **hybrid**: local orchestrator + classifier; gateway for other stations.

Implementer and reviewer must use different vendor families. Local profiles never fall back to paid gateway models.

## Linear (optional)

Set `LINEAR_CONNECTOR` and copy [docs/linear-channel.example.ts](docs/linear-channel.example.ts) to `agent/channels/linear.ts`. The MCP connection registers dynamically when the connector is present.

## Safety

Approval policies in [agent/lib/github/approval.ts](agent/lib/github/approval.ts) match upstream Foreman: unattended runs may open **draft** PRs and comment on their intake issue; they cannot mark PRs ready, write the factory brain, or merge.
