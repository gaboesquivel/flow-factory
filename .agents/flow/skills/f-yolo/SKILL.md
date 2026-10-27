---
name: f-yolo
description: Verify, commit, push, and validate the deployed application using evidence from actual checks.
disable-model-invocation: true
---

# Flow YOLO

## Purpose

Complete the current authorized development task through a bounded delivery pipeline.

Test → Fix → Commit → Push → Deploy → Verify.

The command authorizes ordinary commits and pushes of the current intended task, subject to repository permissions and existing release safeguards.

It does not authorize destructive Git operations, security bypasses, or unrelated changes.

## Preflight

Inspect:

- Current branch and worktree.
- Git status and diff.
- Existing staged changes.
- Task scope.
- Repository verification scripts.
- Available Git remote.
- Deployment configuration.
- Vercel project and branch mappings.

Do not assume every push creates a deployment.

Do not mix unrelated work into the commit.

If the working tree contains changes with unclear ownership, preserve them and avoid staging them blindly.

## Test

Run relevant checks.

Prefer the repository's established QA commands.

For substantial application changes, run the applicable:

- Type checking.
- Linting and formatting validation.
- Unit or integration tests.
- Agent and MCP tests.
- Build checks.
- Browser verification where genuinely relevant.

Do not run expensive or unrelated checks without reason.

## Fix

Fix failures caused by the task when safely within scope.

Retest after fixes.

Use bounded retries.

If verification cannot pass, stop and report the blocker.

Never hide failed tests or skip them silently to obtain a green result.

## Commit

Review the final diff.

Stage only intended files.

Exclude credentials, local logs, generated secrets, and unrelated changes.

Use a meaningful conventional commit message following repository conventions.

Verify the resulting commit SHA.

Do not amend or rewrite unrelated commits.

## Push

Push the authorized current branch to its intended remote.

Respect branch protection.

Never force-push.

Never delete or rewrite remote branches.

Do not promote to production through a separate manual operation unless explicitly authorized.

If the remote cannot be safely determined, stop and report the required decision.

## Deploy

Determine whether a deployment is expected for the pushed commit.

Use existing Vercel integration, CLI, or deployment APIs when available.

Identify the deployment associated with the actual commit SHA.

Do not confuse a previous successful deployment with the new commit.

Perform bounded status checks until success, failure, or a reasonable monitoring limit is reached.

If deployment remains pending, report it as pending rather than successful.

## Verify

After successful deployment, inspect the deployed application.

Verify relevant changed behavior against actual acceptance criteria.

For MCP changes, validate the deployed MCP endpoint and tool behavior with a real client when supported.

For agent changes, exercise representative tool or agent interactions.

For UI changes, inspect the relevant page or interaction when supported.

Check deployment and runtime errors when available.

If the deployed application is protected or inaccessible, report the exact verification limitation.

A successful Vercel build alone is not complete application verification.

## Failure handling

On failure:

- Preserve the current repository state.
- Do not force deployment.
- Do not perform destructive rollback operations without authorization.
- Report the exact failing stage and evidence.
- Suggest the smallest corrective action.

If there is no deployment configured, finish with a clear partial-delivery report rather than inventing a deployment.

## Output

### Delivery
Completed, partial, or blocked.

### Checks
Commands executed and observed results.

### Commit
Actual SHA, subject, and branch.

### Push
Remote and branch confirmation.

### Deployment
Actual Vercel deployment URL and status when available.

### Verification
What was tested against the deployed application.

### Next
Only if something remains unresolved.

## Restrictions

No force push.

No destructive reset.

No unapproved production promotion or rollback.

No secret exposure.

No fabricated deploy success.

No unnecessary documentation ceremony.

Never report Ship as complete when required verification failed.
