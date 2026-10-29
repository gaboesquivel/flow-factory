# Flow Factory

Flow Factory turns GitHub issues into verified software using Vercel's Eve runtime and Foreman's station pipeline.

**Mission:** From intent to verified software.

[Flow Skills](https://github.com/gaboesquivel/flow-skills) supplies product-engineering judgment inside each station. Flow is methodology, not the orchestrator. Humans own consequential decisions; the factory prepares, implements, and independently reviews with evidence, then delivers a **draft** pull request on the configured target repository.

The factory never merges on its own.

## Speed on a small budget

The factory optimizes for time from issue to verified pull request, within a monthly budget the owner sets. It gets speed from:

- **Parallel runs:** independent issues run at the same time, up to a configured concurrency per executor.
- **Specialized agents:** each station role is its own agent with its own skills and model; more specialized reviewers are added only when they prove useful.
- **Events, not polling:** issue labels, pull request comments, and check results start or resume work.
- **Lean sessions:** repository setup, caches, and context are reused across stations and runs instead of rebuilt each time *(hypothesis)*.

## Execution

Each station role runs on an executor from a fixed table the owner edits: an Eve agent on Vercel AI Gateway or a local OpenAI-compatible model, or a subscription CLI (Claude Code, Cursor) *(hypothesis)*. Code runs in an isolated sandbox: Vercel Sandbox in the cloud, or microsandbox on the developer's Mac *(hypothesis)*. An unavailable executor or an exhausted budget stops the run clearly; it never falls back to a separately billed API. Implementer and reviewer come from different model families.

## Who

- A solo developer who queues GitHub issues and reviews draft pull requests, running the factory on Vercel, their own Mac, or both.
- Agent users: an agent session, such as Claude Code in Flow mode, that files a labeled issue to hand work to the factory.

## Core journeys

- Label several issues, walk away, come back to reviewed draft pull requests.
- An agent session files a labeled issue; the factory delivers the reviewed draft pull request.
- Merge the reviewed pull request; the change reaches production.

## Metrics

- **Main:** median time from labeled issue to reviewed draft pull request. Baseline unknown; measure first.
- **Speed to production:** median time from issue to production, including human merge and deploy.
- **Budget:** separately billed spend per merged pull request (tokens plus sandbox), within the monthly cap.
- **Guardrail:** review quality — real defects caught and false alarms per pull request, compared with the Gateway reviewer.
