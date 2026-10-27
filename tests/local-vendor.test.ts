import assert from "node:assert/strict";
import { test } from "node:test";
import { localVendorLabel } from "../agent/lib/models.js";

test("local vendor family infers family before tag colon", () => {
  assert.equal(localVendorLabel("implementer", "deepseek-r1:8b"), "deepseek");
  assert.equal(localVendorLabel("reviewer", "qwen3:4b"), "qwen3");
  assert.equal(
    localVendorLabel("reviewer", "provider/deepseek-v3:8b"),
    "deepseek"
  );
});
