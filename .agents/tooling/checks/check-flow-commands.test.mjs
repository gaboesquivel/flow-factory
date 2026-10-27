import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { repoRoot } from "../lib/repo-paths.mjs";

const commands = [
  {
    command: "flow",
    heading: "# Flow",
    marker: "Never invent execution evidence.",
    mode: null,
  },
  {
    command: "f-council",
    heading: "# Flow Council",
    marker: "Council completion alone never implies approval.",
    mode: "Default mode: quick.",
  },
  {
    command: "f-retro",
    heading: "# Flow Retrospective",
    marker: "A normal code review belongs to /flow Review, not /f-retro.",
    mode: "Default: inspect the latest identifiable completed task or development run.",
  },
  {
    command: "f-extract",
    heading: "# Flow Extract",
    marker: "Do not merge the entire source branch.",
    mode: "/f-extract <source> into <target>",
  },
  {
    command: "f-yolo",
    heading: "# Flow YOLO",
    marker: "Never report Ship as complete when required verification failed.",
    mode: "Test → Fix → Commit → Push → Deploy → Verify.",
  },
];

const read = (relative) => readFileSync(path.join(repoRoot, relative), "utf-8");

const frontmatter = (content) => {
  const match = /^---\n(?<body>[\s\S]*?)\n---/u.exec(content);
  assert.ok(match, "missing YAML frontmatter");
  const fields = {};
  for (const line of match.groups.body.split("\n")) {
    const split = line.indexOf(":");
    assert.ok(split > 0, `invalid frontmatter line: ${line}`);
    fields[line.slice(0, split).trim()] = line.slice(split + 1).trim();
  }
  return fields;
};

const isIgnored = (relative) => {
  const result = spawnSync("git", ["check-ignore", "-q", "--", relative], {
    cwd: repoRoot,
  });
  return result.status === 0;
};

test("canonical Flow skills and Cursor adapters resolve and stay trackable", () => {
  const agents = read("AGENTS.md");
  assert.match(agents, /## Flow commands/u);
  assert.match(agents, /Matt workflow/u);

  for (const entry of commands) {
    const skillRel = `.agents/flow/skills/${entry.command}/SKILL.md`;
    const adapterRel = `.cursor/commands/${entry.command}.md`;
    const skill = read(skillRel);
    const adapter = read(adapterRel);
    const meta = frontmatter(skill);

    assert.equal(meta.name, entry.command);
    assert.equal(meta["disable-model-invocation"], "true");
    assert.ok(meta.description.length > 0);
    assert.match(skill, new RegExp(entry.heading.replaceAll("/", "\\/"), "u"));
    assert.ok(skill.includes(entry.marker));
    if (entry.mode) assert.ok(skill.includes(entry.mode));
    assert.ok(adapter.includes(`\`${skillRel}\``));
    assert.equal(isIgnored(skillRel), false, `${skillRel} is gitignored`);
    assert.equal(isIgnored(adapterRel), false, `${adapterRel} is gitignored`);
    assert.equal(
      existsSync(
        path.join(repoRoot, ".agents/skills", entry.command, "SKILL.md")
      ),
      false
    );
  }

  assert.match(read(".gitignore"), /^\.agents\/skills\/\*$/mu);
  const mattSkill = path.join(repoRoot, ".agents/skills/tdd/SKILL.md");
  if (existsSync(mattSkill)) {
    assert.match(readFileSync(mattSkill, "utf-8"), /^name: tdd$/mu);
  }
});

test("command adapters interpret representative invocations", () => {
  const samples = [
    {
      command: "flow",
      input: "/flow Implement a small bug fix",
      request: "Implement a small bug fix",
    },
    {
      command: "f-council",
      input: "/f-council quick GitHub Issues or local tasks?",
      mode: "quick",
      request: "GitHub Issues or local tasks?",
    },
    {
      command: "f-council",
      input: "/f-council deep Review the GenUI architecture",
      mode: "deep",
      request: "Review the GenUI architecture",
    },
    {
      command: "f-retro",
      input: "/f-retro Review the latest completed task",
      mode: "scoped",
      request: "Review the latest completed task",
    },
    {
      command: "f-extract",
      input: "/f-extract Extract the reusable MCP integration from meta-cto",
      request: "Extract the reusable MCP integration from meta-cto",
    },
    {
      command: "f-yolo",
      input: "/f-yolo",
      request: "",
    },
  ];

  for (const sample of samples) {
    const adapter = read(`.cursor/commands/${sample.command}.md`);
    assert.match(
      adapter,
      new RegExp(`\\.agents/flow/skills/${sample.command}/SKILL\\.md`, "u")
    );
    let rest = sample.input
      .replace(new RegExp(`^/${sample.command}\\s*`, "u"), "")
      .trim();
    if (sample.command === "f-council") {
      let mode = "quick";
      if (rest.startsWith("deep")) mode = "deep";
      else if (rest.startsWith("review")) mode = "review";
      assert.equal(mode, sample.mode);
      if (rest.startsWith(`${mode} `)) rest = rest.slice(mode.length).trim();
    }
    assert.equal(rest, sample.request);
    if (sample.command === "f-retro") {
      const mode =
        rest === "deep" || rest.startsWith("deep ") ? "deep" : "scoped";
      assert.equal(mode, sample.mode ?? "scoped");
    }
  }
});

test("prompt log hooks stay opt-in and registered", () => {
  const hooks = JSON.parse(read(".cursor/hooks.json"));
  assert.equal(
    hooks.hooks.beforeSubmitPrompt[0].command,
    "node .agents/tooling/prompt-log/append-on-stop.mjs submit"
  );
  assert.equal(
    hooks.hooks.stop[0].command,
    "node .agents/tooling/prompt-log/append-on-stop.mjs stop"
  );
  assert.equal(
    read("AGENTS.md").includes("## Local prompt log (enabled)"),
    false
  );
  const pkgDiff = spawnSync(
    "git",
    ["diff", "--exit-code", "--", "package.json"],
    {
      cwd: repoRoot,
    }
  );
  assert.equal(pkgDiff.status, 0);
});
