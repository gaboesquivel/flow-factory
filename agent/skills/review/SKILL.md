---
name: review
description: Review a repository, working tree, or committed comparison for correctness, intent, and maintainability.
disable-model-invocation: true
---

# Review

## Establish scope

Read repository instructions and inspect Git status before choosing the review surface.

- **Repository audit:** inspect current relevant source, supporting files, tests, and owning documents, including untracked files. No baseline commit is required.
- **Working tree:** inspect staged and unstaged diffs plus relevant untracked files. Use `git diff --cached`, `git diff`, and `git ls-files --others --exclude-standard`; read untracked content explicitly.
- **Committed comparison:** resolve the requested reference and use its merge-base with HEAD when appropriate. State the actual comparison. Include working-tree changes only when requested or relevant to the stated scope.
- **Pull request:** treat the PR as a committed comparison from `merge-base(base, head)` through `head`. Product, design, spec, and marketing edits get the same bar as code. Repositories that enforce the **pr-review-contract** (documented in the project's docs tree) in CI expect the same checks without a separate manual invocation.

Default an unspecified review to the current working tree. If it has no changes, inspect the repository area implied by the request and state that scope. Ask only when scope ambiguity materially changes the work. An empty committed diff does not establish that there is nothing to review.

## Inspect

Recover intended behavior from the request, specifications, tests, and accepted product/architecture decisions. Retrieve tracker context only when useful and accessible; report unavailable intent rather than requiring setup.

Assess both:

- **Correctness and intent:** missing requirements, regressions, broken references, failure paths, unsafe side effects, preservation of existing work, and useful test coverage.
- **Maintainability and conventions:** documented standards, duplication, misleading names, unnecessary abstraction, and changes that scatter one responsibility across unrelated modules. Treat design smells as hypotheses, not automatic violations.

Follow important paths through callers and dependencies. A passing test is evidence only for behavior it actually covers. Distinguish **confirmed findings**, **plausible risks**, and **preferences**.

For **consequential** changes (behavior many callers rely on, migrations, concurrency, security boundaries, or data-shape changes), add proportional blast-radius checks: state the observable behavior that must stay true, identify callers and indirect dependents beyond the diff, name the **safety-critical assumption** that makes the change safe, and prove that assumption with code or an executable test when cheap. A convincing explanation is not proof. Qualify unverified assumptions explicitly. Minor documentation or copy edits do not require this depth.

Use independent workers only when available and authorized and the change justifies separate execution (for example specification compliance versus correctness, or adversarial review of a high-impact change). Give each worker a bounded goal; do not edit overlapping files concurrently. Verify findings and synthesize disagreements; record actual models when available. When workers are unavailable, continue directly or sequentially and label the review **single-agent**. Never claim independence or model diversity without actual separate execution.

## Report

Lead with actionable findings ordered by impact. For each, cite the file or line, concrete failure or mismatch, supporting evidence, and smallest viable correction. Separate open questions and verification limits. If no material findings remain, say what was checked.

When the reviewed change affects product intent, experience, architecture, or shared vocabulary, note whether root context (`PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, `ARCHITECTURE.md`) still matches or needs alignment. Flag stale root docs as findings. Flag a change that replaces a project's product identity with Flow's methodology identity. Do not silently rewrite docs unless fixes are requested. The `flow` skill (when installed or surfaced by the host) owns detailed alignment passes. Absence of an always-on hook is not evidence the docs are current. `flow start` is not an initializer; the `start` skill (decision 0010) is the supported initializer when explicitly invoked.

Review is read-only unless fixes are requested. A review request does not authorize publishing comments, changing source, committing, or modifying tracker state.
