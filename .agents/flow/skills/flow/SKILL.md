---
name: flow
description: Run Flow's lean product development workflow from specification through shipping.
disable-model-invocation: true
---

# Flow

## Purpose

Turn a user request into a small, useful, verifiable software change, maintaining product understanding and traceability without unnecessary ceremony.

## Workflow

Spec → Tasks → Build → Review → Ship

These are activities, not mandatory gates. Skip unnecessary activities when the work is already understood.

## Entry

1. Read AGENTS.md and the relevant product, design, and architecture contracts.
2. Inspect relevant code, existing decisions, and GitHub issues.
3. Identify the actual user goal and observable success criteria.
4. Preserve accepted decisions.
5. Resolve only uncertainty that materially affects the work.
6. Choose the smallest useful scope.

Never ask questions already answered by the repository or conversation.

## Spec

Establish:

- Problem and intended outcome.
- Target user and job to be done.
- Functional requirements.
- Important constraints and non-goals.
- UX behavior and relevant design references.
- Acceptance criteria.
- Material uncertainties and proposed decisions.

Use PRODUCT.md, DESIGN.md, and ARCHITECTURE.md as canonical product context.

For substantial multi-session work, create or update a numbered specification following repository conventions.

Do not create specifications for trivial, already-understood changes.

Do not rewrite an implemented historical specification to describe a new feature. Create a new specification or change record instead.

## Tasks

The task is the only execution unit.

Use GitHub Issues as the canonical tracker for multi-session work.

Split substantial specs into small, independently verifiable tasks. Capture dependencies only where necessary.

Avoid epics, initiatives, redundant local task systems, and unnecessary management hierarchy.

A straightforward change may be implemented directly without a GitHub issue.

## Build

Implement the smallest useful increment.

Prefer existing patterns and installed technology skills. Load only the relevant ones.

Colocate Next.js code by route and use shared libraries when genuinely reusable.

Use tests proportionally. Apply TDD to agent and MCP behavior when practical and meaningful.

Do not begin substantial implementation without clear authorization.

Do not expand scope silently.

## Review

Verify against acceptance criteria.

Use relevant automated checks, code review, and runtime verification.

For MCP or agent changes, verify real tool contracts and behavior where supported.

For UI work, verify actual interactions and visual quality when appropriate.

Report failures honestly. Never equate passing tests with proven product value.

## Ship

Complete delivery only when explicitly authorized.

Use /f-yolo when the user wants the complete test, commit, push, deploy, and verification sequence.

Update relevant product documents only when their information materially changes.

## Decisions

Use numbered Decisions for new consequential choices.

Product decisions belong under docs/decisions/.
Factory decisions belong under .agents/flow/decisions/.

Use existing numbering conventions where compatible.

A Decision contains:

- Status: Proposed, Accepted, Superseded, or Rejected.
- Date.
- Context.
- Decision.
- Alternatives and trade-offs.
- Consequences.
- Related specification or task.

Do not create a Decision for every implementation detail.

Preserve existing ADRs as historical records. Do not bulk-migrate or delete them without explicit authorization.

## Collaboration

The user may skip or revisit any activity.

Suggest /f-council only when independent perspectives could materially improve a consequential decision.

Suggest /f-retro when repeated failures or workflow friction justify process improvement.

Never invoke either automatically merely to add ceremony.

## Output

Provide:

- Current activity and status.
- Outcome and material decisions.
- Relevant files and GitHub issues.
- Verification evidence.
- Remaining risks or blockers.
- One recommended next action.

Use the existing Task report convention.

Report skills actually loaded and actual model identifiers when available.

Never invent execution evidence.
