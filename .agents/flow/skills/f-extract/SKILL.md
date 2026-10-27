---
name: f-extract
description: Extract reusable, product-agnostic capabilities from development branches into the clean Flow starter.
disable-model-invocation: true
---

# Flow Extract

## Purpose

Extract reusable engineering capabilities from an experimental or product branch into the generic starter without carrying over its product-specific behavior.

The goal is a cleaner starter, not a larger starter.

## Invocation

/f-extract <source branch or feature>
/f-extract <source> into <target>

Inspect repository state before deciding which branches to read or modify.

If source or target cannot be safely determined, identify the ambiguity before changing branches.

## Inspect

1. Check current Git status and worktree.
2. Identify source and target refs.
3. Inspect source changes and dependencies.
4. Compare against the starter's existing capabilities.
5. Read relevant architecture and product contracts.
6. Identify the minimal reusable functionality.

Never silently discard or overwrite uncommitted changes.

For multi-branch operations, use safe isolated worktrees when available.

## Classification

Separate changes into:

### Reusable

- Generic UI primitives.
- Shared component patterns.
- Agent and MCP integration abstractions.
- Generic API contracts.
- Framework-independent utilities.
- Configuration patterns.
- Tests for reusable behavior.
- Generic fixtures and examples.

### Product-specific

- Customer-specific workflows.
- Domain-specific entities and business rules.
- Branding, assets, and copy.
- Production credentials.
- Hardcoded application data.
- Feature-specific routes.
- Product-specific seed data.
- Unrelated dependencies.

Exclude product-specific material.

## Extraction

Produce the smallest reusable capability that retains meaningful value.

Preserve existing starter conventions.

Use route colocation in Next.js.

Extract to shared packages only when reuse warrants it.

Avoid premature abstraction.

Avoid transferring an entire feature when a small primitive or utility is enough.

Use generic naming, data, and documentation.

Never copy secrets.

Avoid source-product terminology in public starter APIs.

## Functional preservation

Write tests that describe the reusable behavior independently from the source product.

Verify that the extracted capability works in the starter's actual architecture.

For agent or MCP capabilities, test tool contracts and relevant real interactions.

Do not assume copied tests prove portability.

## Acceptance

The extraction succeeds when:

- The capability is useful beyond the source product.
- Product-specific behavior is absent.
- Dependencies remain proportionate.
- Relevant tests pass.
- Existing starter behavior remains intact.
- The capability can be understood without knowledge of the source branch.
- Documentation reflects only the generic capability.

## Output

### Source
Branches, commits, or features inspected.

### Extracted
Reusable capabilities implemented.

### Excluded
Product-specific functionality deliberately left behind.

### Changes
Files and dependencies added, changed, or removed.

### Verification
Tests run, outcomes, and limitations.

### Git
Actual branch and commit state.

## Restrictions

Do not merge the entire source branch.

Do not remove product-specific source code merely because it was excluded from the starter.

Do not push unless separately authorized.

Do not broaden starter scope without a clear reusable benefit.

Do not create an additional extraction framework.

Optimize for simplicity and portability.
