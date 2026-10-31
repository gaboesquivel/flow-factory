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
- **Committed comparison:** resolve the requested reference and use its merge-base with HEAD when appropriate. State the actual comparison.
- **Pull request or pushed branch:** treat it as a committed comparison from `merge-base(base, head)` through `head`. Product, design, spec, and documentation edits get the same bar as code.

After a fix round, review the commits since the last reviewed head and the findings they answer; widen only when the fix reaches code the earlier review did not cover.

## Inspect

Recover intended behavior from the request, specifications, tests, and accepted product and architecture decisions. Report unavailable intent rather than requiring setup.

Assess both:

- **Correctness and intent:** missing requirements, regressions, broken references, failure paths, unsafe side effects, and preservation of existing work. A changed contract (API route, MCP tool, or the domain function behind them) has a check that would fail without the change; a missing UI test is a finding only when the work item asked for one.
- **Maintainability and conventions:** documented standards, duplication, misleading names (a second name for a `GLOSSARY.md` concept is a finding), unnecessary abstraction, and changes that scatter one responsibility across unrelated modules. Treat design smells as hypotheses, not automatic violations.
- **Scope:** additions nobody asked for and accepted behavior the diff does not deliver.

Follow important paths through callers and dependencies. A passing check is evidence only for the behavior it covers; a check result on an unchanged head stands, so re-run only the focused checks for the changed behavior, not the full suite. Distinguish **confirmed findings**, **plausible risks**, and **preferences**.

For **consequential** changes (behavior many callers rely on, migrations, concurrency, security boundaries, or data-shape changes), add proportional blast-radius checks: state the observable behavior that must stay true, identify callers and indirect dependents beyond the diff, name the **safety-critical assumption** that makes the change safe, and prove it with code or an executable check when cheap. A convincing explanation is not proof. Minor documentation or copy edits do not need this depth.

## Report

Lead with actionable findings ordered by impact. For each, cite the file or line, the concrete failure or mismatch, supporting evidence, and the smallest viable correction. Separate open questions and verification limits. If no material findings remain, say what was checked.

When the change affects product intent, experience, architecture, or shared vocabulary, note whether the target's root context (`PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, `ARCHITECTURE.md`) still matches. Flag stale root docs, and flag a change that replaces the project's product identity with Flow's methodology identity.

Review is read-only. A review does not authorize changing source, committing, publishing comments, or modifying tracker state.
