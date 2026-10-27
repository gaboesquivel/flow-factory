import assert from "node:assert/strict";
import test from "node:test";

import { parseAcceptanceCriteria } from "../src/github/parse.js";
import { mapProjectStatusToColumn } from "../src/github/map.js";
import { defaultGithubConfig } from "../src/github/config.js";

test("parse acceptance criteria section", () => {
  const body = `## Acceptance criteria\n- [ ] One\n- [ ] Two\n\n## Notes\nignored`;
  assert.deepEqual(parseAcceptanceCriteria(body), ["One", "Two"]);
});

test("map project status names to columns", () => {
  const config = defaultGithubConfig({
    owner: "gaboesquivel",
    repo: "flow-factory",
    ownerType: "user",
  });
  assert.equal(
    mapProjectStatusToColumn({
      statusName: "Ready",
      config,
      fallback: "backlog",
    }),
    "ready",
  );
});
