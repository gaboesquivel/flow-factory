---
name: flow
description: Align the current project's PRODUCT.md, DESIGN.md, GLOSSARY.md, and ARCHITECTURE.md after meaningful product, design, architecture, or terminology changes.
disable-model-invocation: false
---

# Flow Lite

**Preserve intent** for the target project. Align its root context when work changes what that product is, how it behaves, how it is built, or how the team names important concepts.

This skill is not a workflow router and does not authorize implementation by itself. It does not initialize or scaffold repositories.

## Process

1. Read the existing `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` when present. Read relevant `docs/specs/` and `docs/decisions/` records only when they clarify the area you are aligning. Treat what you read as current only after checking it against the code it describes.
2. Update only the sections the change affected. Keep one home per fact; link to specs, decisions, or code instead of duplicating detail that is cheap to rediscover. A glossary term the change resolved names its concept everywhere.
3. Create a root file only when it would hold meaningful content about the target project. Do not scaffold empty trees, Flow methodology boilerplate, or parallel trackers.

## Boundaries

- `PRODUCT.md` is the target project's product identity. Do not replace it with Flow's tagline, mission, or principles.
- Do not edit `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or similar instruction files.
- Do not create `docs/specs/` or `docs/decisions/` records here; use `to-spec` when a durable spec is justified.

## Completion

State which root files changed and which facts they now reflect. Note unresolved assumptions.
