---
name: to-spec
description: Turn the current conversation into a numbered specification using project conventions; save only when requested.
disable-model-invocation: true
---

Turn conversation context and repository understanding into a proportionate specification. Do not run a separate interview; synthesize what is already known and label unresolved assumptions rather than inventing decisions.

Use the project's existing spec location when one exists, else `docs/specs/NNN-short-name.md` (next three-digit number, kebab-case slug). Preserve existing numbering, labels, and trackers. A written spec starts as `Status: draft (YYYY-MM-DD).`; acceptance happens outside this skill.

**One bet.** A spec tests one assumption and ships as one unit; split only when a part proves something or ships safely alone, or needs an earlier part's learning. A choice gets a decision record (`docs/decisions/NNNN-short-name.md`, status **Proposed**) only when it chose among real alternatives **and** reaches beyond this spec or is costly to reverse; otherwise it is a Decisions bullet. Records never hold scope or tasks.

**Length.** About 1,000 words at most: link records, glossary, and code instead of restating them. Keep small, understood changes brief, and omit headings that do not fit the discipline.

## Process

1. Explore only what the conversation lacks. Name things with the project's `GLOSSARY.md` terms, never a second name for a resolved concept, and respect decision records in the area you are touching. Sketch test seams, preferring existing high-level ones.
2. Write the spec from the template below. Save or publish only when requested.

<spec-template>

## Problem

Who is affected, what fails today, and the evidence.

## Solution

The change, from the user's side.

## Decisions

Only choices that shape execution, contract-first: typed API, MCP tools when agents are users, and errors and permissions an agent can act on.

**Exposure** (required for deployable behaviour): where it runs, who can reach it, and how writes behave without authentication; with authentication out of scope, writes fail closed.

**Appetite** (substantial work): the first verifiable slice, what gives way first, and any material cost limit.

A direction change without a record: the file, old position, new one.

## Acceptance

**Acceptance scenario** (required; review gives each step a verdict): the actor, the starting state with realistic data, and numbered steps with observable results; for agent users, also through the MCP tool. A metric the work should move gets a step proving it counts correctly.

Then invariants, each with the focused check proving it (seam and command), per `implement` Tests.

## Out of Scope

What this increment does not include.

</spec-template>

A spec without an acceptance scenario, or without **Exposure** when it adds deployable behaviour, is incomplete: name what is missing.
