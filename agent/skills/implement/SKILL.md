---
name: implement
description: Implement an authorized change from a request, specification, or task.
disable-model-invocation: true
---

# Implement

Read the relevant request, repository instructions, current context, and code. If the user supplies a task reference, retrieve it with available tools and resolve consequential ambiguity. A tracker, setup step, or formal spec is not a prerequisite for a clear small change.

State the intended observable result and implement the smallest useful increment using existing patterns. Preserve unrelated working-tree changes. Ordinary small fixes do not need architecture work or a formal spec.

## Shared language

A resolved `GLOSSARY.md` term names its concept everywhere: code identifiers, test names, and agent interfaces (tool and API names). Never introduce a second name for it. When the request uses a synonym, settle the meaning from the glossary, then from code and docs, and use the resolved term. When those sources conflict or are silent and the meaning changes behavior, make the narrowest reasonable choice and record it as a deviation. Add a glossary entry only for a term the work resolves and that will recur.

## Tests

A testing policy in the target repository's `ARCHITECTURE.md` overrides this default.

- **Contracts are test-first.** For a new or changed API route, MCP tool, or the domain function behind them, write the focused check first, run only it, and see it fail. Cover input, result, actionable errors, and permissions, one check per behavior; test adapters only for agreeing with it.
- **Other behavior** gets a focused check that fails without the change; docs, configuration, copy, and prototypes get none.
- **No UI tests by default.** Add one only when the work item asks or the same UI regression returns.
- **Focused, then full once:** focused checks while working; the repository's full checks once, on the final head before delivery.

## Scope

Accepted scope: the work item and its plan, or the spec's acceptance scenario, Out of Scope, and appetite.

- **New scope** (a dependency, refactor, UI surface, infrastructure, test harness, or another spec) is not started because it is nearby; record it as a deviation recommending defer, replace, or reject. A small prefactor the accepted work needs proceeds.
- **Blockers are not scope.** A correctness, security, or required-check failure is fixed inside the work or reported as why it cannot ship, never cut by weakening a check.
- **Data changes:** a stored-data shape change ships as a versioned migration with the code, never a schema applied to a shared or deployed database. A destructive step (dropping, renaming, or narrowing a table or column) goes through expand-contract, or is left out and reported; name its rollback or backup first. Never seed, reset, or truncate shared data.
- **Spend:** a paid operation, such as a live evaluation, runs only when its result changes a decision.
- **Before delivery**, compare the diff with the scope and name unrequested additions and accepted behavior it does not deliver.

## Delivery

When behavior or vocabulary changes, update the target project's owning documentation (`PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, `ARCHITECTURE.md`) only in the sections affected. Do not replace a project's product identity with Flow's methodology identity. Do not open new spec or decision files unless the work item asked or the repository already uses that convention.

Report the result, files, checks with their real output, limitations, and remaining work. Report elapsed time and cost only when observed; otherwise say "not measured". Commit, push, or deploy only when that delivery action is already authorized. Never commit or push to the default branch, rewrite a remote branch, skip or weaken a check, or do anything destructive or unrelated.
