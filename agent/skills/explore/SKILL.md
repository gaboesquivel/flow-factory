---
name: explore
description: Understand the problem, users, repository context, and consequential uncertainty before planning or building.
disable-model-invocation: true
---

# Explore

Read supplied briefs, conversation, canonical product documents, relevant code, and the decisions and specs the request may conflict with, each labeled by status and location. Recover facts with available tools; ask only for choices or missing information you cannot infer.

Classify the work (new product, existing product change, or internal improvement) and choose proportionate discovery; never ask for depth. A fix or small change needs no discovery beyond the direction check below.

For a feature, recover: clear intent, the journeys it changes (one line each), agent users or "none", the metric it should move, and the delivery constraint: appetite (a time target), first verifiable increment, non-goals, and any material model or infrastructure cost limit. These belong to the increment, never to `PRODUCT.md`. Keep existing metric definitions; define a new one by the journey outcome it observes, what counts, population, window, source, baseline (or "unknown"), and target. An unevidenced target is a hypothesis.

Map users, constraints, risks, and open questions. Distinguish accepted decisions from proposals. Separate missing product information from implementation detail that can remain undecided.

**Direction changes.** When the work would reverse or narrow an Accepted decision, an accepted or implemented spec, or a `PRODUCT.md` fact, name each conflicting file, quote its position, and say whether the change supersedes or amends it. That is unconfirmed: do not plan as if it were approved. Draft specs and Proposed decisions do not gate.

Use the target's `GLOSSARY.md` terms when restating the work; a synonym in the request maps to the resolved term. Load `to-spec` only when the next step is a written increment.

Stop when the problem, intended outcome, and next useful activity are clear enough for the requested work. Return a concise summary: known facts, unresolved assumptions, any direction conflicts, recommended next activity, and whether implementation is still unauthorized.

Discussion and exploration do not authorize implementation.
