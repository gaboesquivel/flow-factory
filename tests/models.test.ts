import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertIndependentReview,
  GATEWAY_MODELS,
  providerPrefix,
  resolveModelProfile,
} from "../agent/lib/model-policy.js";

const vendorFamiliesError = /different model vendor families/;
const gatewayProfileRequired = /FACTORY_MODEL_PROFILE=gateway/;

test("gateway models use different vendor families for implementer and reviewer", () => {
  assertIndependentReview({
    implementerId: GATEWAY_MODELS.implementer,
    implementerVendor: providerPrefix(GATEWAY_MODELS.implementer),
    reviewerId: GATEWAY_MODELS.reviewer,
    reviewerVendor: providerPrefix(GATEWAY_MODELS.reviewer),
  });
});

test("assertIndependentReview rejects identical vendors", () => {
  assert.throws(
    () =>
      assertIndependentReview({
        implementerId: "a",
        implementerVendor: "same",
        reviewerId: "b",
        reviewerVendor: "same",
      }),
    vendorFamiliesError
  );
});

test("vercel deployment rejects local profile", () => {
  process.env.VERCEL = "1";
  process.env.FACTORY_MODEL_PROFILE = "local";
  assert.throws(() => resolveModelProfile(), gatewayProfileRequired);
  delete process.env.VERCEL;
  process.env.FACTORY_MODEL_PROFILE = "gateway";
});
