# Development and runtime skills

These skill trees serve different agents. Updating one does not update the other.

| Path               | Owner and purpose                                                             |
| ------------------ | ----------------------------------------------------------------------------- |
| `skills-lock.json` | Reproducible sources and hashes for development skills                        |
| `.agents/skills/`  | Installed Flow catalog for agents maintaining this repository; ignored by Git |
| `.claude/skills/`  | Claude Code links installed by the skills CLI; ignored by Git                 |
| `agent/skills/`    | Committed, adapted skills used by Eve's runtime stations                      |

## Development installation

From the repository root:

```bash
pnpm dlx skills experimental_install
```

To refresh only the Flow development catalog for Codex and Claude Code:

```bash
pnpm dlx skills add gaboesquivel/flow-skills --skill '*' --agent codex claude-code -y
```

Commit `skills-lock.json`, not local installs. The Flow block in [AGENTS.md](../AGENTS.md) describes invocation. Root context remains Flow Factory's product, not Flow Skills' methodology identity. Factory's human-only ready/merge boundary still applies.

## Runtime adaptations

[FLOW_SKILLS.md](../agent/skills/FLOW_SKILLS.md) records the upstream baseline and deliberate station adaptations. Runtime `implement` is adapted from development `build`; it is not a missing or outdated development skill. Do not replace runtime skills with the full development catalog or advance their provenance without reviewing the adaptations and their tests.
