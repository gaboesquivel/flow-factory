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

- **Contracts are test-first.** When the change adds or changes a contract (an API route, an MCP tool, or the domain function behind them), write its focused check first, run only that check and see it fail, then implement until it passes. The check covers what a caller depends on: input, result, the errors a caller can act on, and permissions. One check per behavior, not per function.
- **Other behavior** gets a focused check that fails without the change, in any order. Internals behind a contract get no separate tests unless their logic is the risk.
- **No UI tests by default.** Add a UI or end-to-end test only when the work item asks for one or the same UI regression returns.
- **Focused, then full once.** While working, run only the focused check (its file or test name). Run the repository's full checks once, on the final head before delivery.
- **Proportion.** Docs, configuration, and copy changes get no new check; a small fix gets one focused check or a reproduction.

## Scope

The accepted scope is the work item and its plan. Do not add scope because it is nearby: no unrequested dependency, refactor, UI surface, or test harness. A small prefactor the accepted work needs proceeds. A correctness, security, or required-check failure is fixed inside the work, never cut by weakening a check. Before delivery, compare the diff with the scope and name additions nobody asked for and accepted behavior it does not deliver.

## Delivery

When behavior or vocabulary changes, update the target project's owning documentation (`PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, `ARCHITECTURE.md`) only in the sections affected. Do not replace a project's product identity with Flow's methodology identity. Do not open new spec or decision files unless the work item asked or the repository already uses that convention.

Report the result, files, checks with their real output, limitations, and remaining work. Report elapsed time and cost only when observed; otherwise say "not measured". Commit, push, or deploy only when that delivery action is already authorized.
