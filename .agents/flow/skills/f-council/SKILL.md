---
name: f-council
description: Obtain independent expert perspectives and evidence-based synthesis for consequential decisions.
disable-model-invocation: true
---

# Flow Council

## Purpose

Improve decision quality through independent, adversarial expert review.

The council is advisory. It does not implement, approve, or change decisions automatically.

## Invocation

/f-council <question or proposal>
/f-council quick <question>
/f-council deep <question>
/f-council review <specification or file>

Default mode: quick.

## Context

Read relevant specifications, decisions, implementation, and repository constraints.

Clearly identify the decision to be evaluated.

Distinguish accepted requirements from assumptions and proposals.

## Reviewers

Select specialists dynamically according to the question.

Typical perspectives include:

- Product and user value.
- UX and interaction design.
- Engineering and architecture.
- Testing and operational reliability.
- Security and risk.
- Contrarian and simpler alternatives.

Do not use the same fixed panel for every question.

Always ensure at least one reviewer actively challenges the proposal.

## Quick mode

Use three complementary expert perspectives.

Run one independent review round.

Reviewers should evaluate the same initial evidence without access to one another's conclusions.

Execute reviews concurrently when genuine isolated workers are available.

## Deep mode

Use up to five relevant perspectives.

Perform independent reviews first.

After collecting the initial findings, allow one targeted rebuttal round addressing material disagreements.

Stop after that round.

Do not conduct an unlimited debate.

## Review contract

Each reviewer provides:

1. Recommendation.
2. Supporting evidence.
3. Assumptions and uncertainty.
4. Risks and trade-offs.
5. Strongest viable alternative.
6. What evidence would change the recommendation.

Ask reviewers to challenge user and agent assumptions respectfully.

## Independence

Use genuinely independent agent contexts when supported.

Prefer model diversity when actually available and useful.

If multiple independent agents are unavailable, explicitly label the exercise as a single-agent multi-perspective analysis.

Never claim independent execution when none occurred.

Never invent model diversity.

## Synthesis

The coordinating agent identifies:

- Areas of agreement.
- Material disagreements.
- Evidence quality.
- Unresolved assumptions.
- Strongest objections.
- Simplest viable solution.
- Recommended decision.

Agreement is not proof of correctness.

Do not decide based on majority voting.

Prioritize arguments, evidence, and trade-offs.

## Output

### Verdict
One concise recommendation and its evidential confidence.

### Consensus
Findings supported by independently produced reviews.

### Disagreements
Meaningful conflicting conclusions and why they differ.

### Risks and alternatives
Key failure modes and simpler viable options.

### Next action
One concrete recommended step.

### Execution
Actual reviewers, available model identifiers, evidence inspected, and execution limitations.

## Restrictions

Read-only by default.

Do not modify product code.

Do not create or accept Decisions automatically.

Do not produce tasks or specifications unless explicitly requested.

Do not fabricate findings or citations.

Keep quick-mode output concise.

## Integration

The council may be invoked independently or during /flow.

If the human approves a consequential decision, use Flow's existing documentation conventions to capture it.

Council completion alone never implies approval.
