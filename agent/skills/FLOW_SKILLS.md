# Flow Skills provenance

Adapted from [gaboesquivel/flow-skills](https://github.com/gaboesquivel/flow-skills) at commit `14c8885` (2026-11-03).

| Skill here | Upstream source | Adaptation |
| --- | --- | --- |
| `explore` | `explore` (Read first, Direction changes, Proportion) | Station-sized: no interview, stress test, or writes; a direction conflict is reported, not confirmed |
| `to-spec` | `to-spec` (One bet, Length, template) | Template only; no numbering script, acceptance, sharing, or issue flow |
| `implement` | `build` (Outcome, Tests, Scope guard, Data changes) and `domain-modeling` (Shared language) | No branch, PR, or merge steps: Foreman owns delivery; open questions become deviations because stations cannot ask mid-run, so new scope is recorded as a deviation |
| `review` | `review` and `agents/flow-reviewer.md` (risk tiers, verdicts, findings) | Read-only station review of a pushed branch: no repair, `/code-review`, or posting; the implementer repairs |
| `flow` | `flow` (Flow Lite) | Target-project alignment only |

Flow provides engineering judgment inside Foreman stations; it is not a second workflow engine. When refreshing, compare against these upstream sections and update the commit above.
