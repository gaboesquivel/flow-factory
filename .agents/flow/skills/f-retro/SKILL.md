---
name: f-retro
description: Analyze actual development runs and propose evidence-backed improvements to Flow's reliability and efficiency.
disable-model-invocation: true
---

# Flow Retrospective

## Purpose

Improve Flow using evidence from actual development work.

Evaluate the development process, not merely whether the implementation meets its requirements.

Do not create reports without actionable learning.

## Invocation

/f-retro
/f-retro <task, run, branch, or commit>
/f-retro deep

Default: inspect the latest identifiable completed task or development run.

Deep: identify recurring patterns across multiple available runs.

## Evidence

Inspect available:

- User request and expected outcome.
- Specification and acceptance criteria.
- Agent execution records.
- Prompt and run logs.
- Actual models used.
- Subagent outputs.
- Tool errors and retries.
- Commits and diffs.
- Test results.
- Review findings.
- Deployment and verification evidence.
- User corrections and feedback.

If evidence is unavailable, identify the gap.

Never invent timings, costs, models, retries, or success metrics.

## Analysis

Identify:

### What worked

Successful behaviors worth retaining.

### What failed

Observed errors, missed requirements, poor decisions, or incomplete verification.

### What was wasteful

Avoidable token consumption, repeated attempts, unnecessary documents, excessive handoffs, redundant agents, and overcomplicated workflows.

### What was missing

Important context, tooling, verification, documentation, or feedback.

### Root causes

Distinguish:

- Model limitation.
- Insufficient context.
- Skill instruction failure.
- Tool or environment failure.
- Orchestration failure.
- Missing acceptance criteria.
- Inadequate testing.
- Unclear user requirements.
- Isolated execution mistake.

Do not attribute every failure to the model.

Distinguish observed causes from hypotheses.

## Improvement proposals

Recommend no more than three changes.

Rank by:

1. Expected impact on successful task completion.
2. Strength of supporting evidence.
3. Implementation cost.
4. Regression risk.
5. Complexity added.

Prefer removing unnecessary process over adding instructions.

Each proposal must include:

- Problem and supporting evidence.
- Suspected root cause.
- Exact skill, tool, or workflow affected.
- Minimal proposed change.
- Expected benefit.
- Validation method.
- Risk of regression.

## Approval

Do not automatically rewrite Flow skills or conventions.

Show proposed changes and request approval.

After approval, modify only the affected instructions or tooling.

Avoid unrelated refactoring.

## Validation

Where practical, create a reproducible regression case.

Compare behavior with a known baseline.

Use genuine execution evidence.

A successfully edited skill is not proof the workflow improved.

Mark improvements as unvalidated until later runs demonstrate their effect.

## Logging

Use existing journal and prompt/run logging infrastructure.

Workers may return structured execution metadata.

Only the coordinating agent should reconcile shared logs unless the existing logger explicitly guarantees safe concurrent writes.

Preserve existing opt-in and privacy requirements.

## Output

### Retrospective
Task or run examined and available evidence.

### Worked
Important successful patterns.

### Failed
Observed failures and evidence.

### Root causes
Supported explanations and uncertainties.

### Improvements
Up to three prioritized proposals with affected files.

### Validation
How to determine whether the changes actually help.

### Approval
Changes requiring explicit authorization.

## Restrictions

No automatic self-modification.

No recursive retrospective loops.

No mandatory retrospective after every task.

No invented metrics.

No new documentation artifact unless it preserves meaningful reusable evidence.

A normal code review belongs to /flow Review, not /f-retro.
