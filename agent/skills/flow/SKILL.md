---
name: flow
description: Align the current project's PRODUCT.md, DESIGN.md, GLOSSARY.md, and ARCHITECTURE.md after meaningful product, design, architecture, or terminology changes.
disable-model-invocation: false
---

# Flow Lite

**Preserve intent** for the project you are in. Align its root context when work changes what that product is, how it behaves, how it is built, or how the team names important concepts.

This skill is **not** a workflow router: it does not run explore → spec → build sequences or authorize implementation by itself. It is **not** project initialization.

## Whose product

- **Adopter project:** `PRODUCT.md` is that project's product identity. Update only the sections the change affected.
- **This flow-skills repository:** `PRODUCT.md` is Flow's methodology identity. Edit it when that identity changes. Do not copy it into another repository.

Do not replace a project's product identity with Flow's tagline, mission, principles, or strategic chain.

`flow start` and "start project" are not this skill. The optional `start` skill (decision 0010) initializes from flow-next or flow-mono when installed and explicitly requested. If someone asks to scaffold a repository without `start`, stop and do not create starter trees, instruction-file snippets, or a Flow-branded `PRODUCT.md`.

## Invocation

Hosts may surface this skill when they honor discoverable metadata. That is optional and not an always-on hook, and it is not evidenced on every host. Confirmed portable behavior is narrower: the user invokes `/flow`, or `implement` and `review` apply the same alignment rules when those skills are in use. Do not claim alignment ran only because metadata allows a host to suggest this skill.

## Process

1. Read existing `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` when present. Read relevant `docs/specs/` and `docs/decisions/` records only when they clarify the area you are aligning.
2. Update only sections affected by the change. Keep one home per fact; link to specs, decisions, or code instead of duplicating detail that is cheap to rediscover.
3. Create a root file only when it would hold meaningful content about the current project. Do not scaffold empty trees, Flow methodology boilerplate, or parallel trackers (no PRD/PDR/ADR folders).

## Boundaries

- Do not edit adopter `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or similar instruction files.
- Do not require installation, initialization, or a prior skill invocation.
- Do not treat alignment edits as permission to implement unrelated code. For authorized implementation and tests, invoke the `implement` skill when installed.
- Do not create `docs/specs/` or `docs/decisions/` records here; use `to-spec` or explicit decision work when durable bounded artifacts are justified.
- Suggest other skills (`to-spec`, `review`, …) only when the user asks; no mandatory chain.

## Completion

State which root files changed and whose product they now reflect. Note unresolved assumptions and whether the user may want a spec or decision record via another skill.
