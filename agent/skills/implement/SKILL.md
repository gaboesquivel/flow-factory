---
name: implement
description: Implement an authorized change from a request, specification, or task.
disable-model-invocation: true
---

# Implement

Read the relevant request, repository instructions, current context, and code. If the user supplies a task reference, retrieve it with available tools and resolve consequential ambiguity. A tracker, setup step, or formal spec is not a prerequisite for a clear small change.

State the intended observable result and implement the smallest useful increment using existing patterns. Preserve unrelated working-tree changes. Do not add scope just because it is nearby. Ordinary small fixes do not need architecture work or a formal spec.

For consequential domain or API changes, understand module ownership, name the data shapes and caller expectations before committing to a new abstraction, and prefer a small executable test over extended debate when an observable fact is cheap to check.

For meaningful behavior changes, prefer tests at established public interfaces when the project already tests that way. Run focused checks while working and applicable final checks once the change stabilizes.

Review the actual changed files, including untracked files, against the request and project constraints. Optional `review` skill guidance can inform a self-check when that skill is installed; a separate review pass is not required.

When behavior or accepted context changes, update owning documentation. For meaningful product, design, architecture, or terminology shifts, align the current project's `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` (create a root file only when it would hold meaningful content about that project). Do not replace a project's product identity with Flow's methodology identity. `flow start` and "start project" do not authorize initialization; do not scaffold a new repository unless the `start` skill is installed and explicitly invoked (decision 0010). Link to specs or decisions instead of duplicating durable rationale; do not open new spec or decision files unless the user asked or the work already uses that convention.

Report the result, files, checks, limitations, and remaining work. Commit, publish, push, or deploy only when that delivery action is already authorized; implementation alone does not require it.
