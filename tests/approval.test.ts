import assert from "node:assert/strict";
import { test } from "node:test";
import type { ApprovalContext, ApprovalStatus } from "eve/tools/approval";
import {
  createPullRequestPolicy,
  factoryBrainPolicy,
  pullRequestCommentPolicy,
  shipPolicy,
} from "../agent/lib/github/approval.js";
import {
  AUTONOMOUS_PRINCIPAL,
  stampAutonomousForIssue,
  stampAutonomousForPullRequest,
} from "../agent/lib/trust.js";

const isDenied = (status: ApprovalStatus) =>
  typeof status === "object" && status !== null && status.type === "denied";

const autonomousCtx = (): ApprovalContext =>
  ({
    session: {
      auth: {
        current: stampAutonomousForIssue(
          {
            attributes: {},
            authenticator: "app",
            principalId: AUTONOMOUS_PRINCIPAL,
            principalType: "service",
          },
          42
        ),
        initiator: null,
      },
    },
    toolInput: {},
  }) as ApprovalContext;

test("unattended runs may open draft pull requests", () => {
  const status = createPullRequestPolicy({
    ...autonomousCtx(),
    toolInput: { draft: true },
  });
  assert.equal(status, "not-applicable");
});

test("unattended runs cannot mark pull requests ready", () => {
  const status = shipPolicy(autonomousCtx());
  assert.ok(isDenied(status));
});

test("unattended runs cannot write the factory brain", () => {
  const status = factoryBrainPolicy(autonomousCtx());
  assert.ok(isDenied(status));
});

test("unattended CI-fix runs may comment on anchored pull request", () => {
  const ctx = {
    session: {
      auth: {
        current: stampAutonomousForPullRequest(
          {
            attributes: {},
            authenticator: "app",
            principalId: AUTONOMOUS_PRINCIPAL,
            principalType: "service",
          },
          99
        ),
        initiator: null,
      },
    },
    toolInput: { pullNumber: 99 },
  } as unknown as ApprovalContext;
  assert.equal(pullRequestCommentPolicy(ctx), "not-applicable");
});

test("unattended issue runs cannot comment on unrelated pull requests", () => {
  const ctx = {
    session: {
      auth: {
        current: stampAutonomousForIssue(
          {
            attributes: {},
            authenticator: "app",
            principalId: AUTONOMOUS_PRINCIPAL,
            principalType: "service",
          },
          42
        ),
        initiator: null,
      },
    },
    toolInput: { pullNumber: 99 },
  } as unknown as ApprovalContext;
  assert.ok(isDenied(pullRequestCommentPolicy(ctx)));
});
