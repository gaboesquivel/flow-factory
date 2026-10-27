import assert from "node:assert/strict";
import { test } from "node:test";
import type { ApprovalContext, ApprovalStatus } from "eve/tools/approval";
import {
  createPullRequestPolicy,
  factoryBrainPolicy,
  shipPolicy,
} from "../agent/lib/github/approval.js";
import { AUTONOMOUS_PRINCIPAL, stampAutonomous } from "../agent/lib/trust.js";

const isDenied = (status: ApprovalStatus) =>
  typeof status === "object" && status !== null && status.type === "denied";

const autonomousCtx = (): ApprovalContext =>
  ({
    session: {
      auth: {
        current: stampAutonomous(
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
