---
name: to-spec
description: Turn the current conversation into a numbered specification using project conventions; save only when requested.
disable-model-invocation: true
---

Turn conversation context and repository understanding into a proportionate specification. Do not run a separate interview; synthesize what is already known and label unresolved assumptions rather than inventing decisions. Keep consequential assumptions visible.

Use the project's existing spec location when one exists. When the project has no convention, default new work to `docs/specs/NNN-short-name.md` (three-digit sequence, kebab-case slug) and follow the same pattern for updates. Use `docs/decisions/NNN-short-name.md` only for standalone consequential decisions, not for feature scope. Preserve existing numbering, labels, and trackers when the repository already uses them.

Specs may cover product, research, marketing, engineering, operations, or cross-functional work. Use the sections below only when they fit the discipline; omit irrelevant headings. Keep small, understood changes brief.

## Process

1. Explore the repository when needed. Use the project's domain vocabulary and respect decision records in the area you are touching.

2. Sketch test seams at the highest practical level. Prefer existing seams; propose new ones only when necessary and as high as possible.

3. Write a proportionate spec using the relevant sections below. Save or publish only when requested.

<spec-template>

## Problem Statement

The problem from the affected user's perspective.

## Solution

The intended solution from the user's perspective.

## User Stories

Essential scenarios and acceptance criteria when they improve clarity, for example:

1. As an <actor>, I want a <feature>, so that <benefit>

Cover consequential paths and failure cases without redundant stories.

## Implementation Decisions

Decisions that shape execution: modules, interfaces, contracts, schema, or interactions. Prefer stable interfaces and intent over exhaustive file lists.

When a prototype encodes a decision more precisely than prose (state machine, schema, type shape), inline the decision-rich excerpt and note that it came from a prototype.

## Testing Decisions

What good tests mean here, which behavior is in scope, and prior art in the codebase.

## Out of Scope

What this increment explicitly does not include.

## Further Notes

Additional context that helps execution or review.

</spec-template>
