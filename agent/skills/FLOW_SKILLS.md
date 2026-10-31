# Flow Skills provenance

Adapted from [gaboesquivel/flow-skills](https://github.com/gaboesquivel/flow-skills) at commit `4ab6383` (2026-10-31).

| Skill here | Upstream source | Adaptation |
| --- | --- | --- |
| `explore` | `explore` | Station-sized: no interview, no optional skills |
| `to-spec` | `to-spec` | Template only; no acceptance or issue flow |
| `implement` | `build` (Outcome, Tests, Scope guard) and `domain-modeling` (Shared language) | No branch, PR, or merge steps: Foreman owns delivery; open questions become deviations because stations cannot ask mid-run |
| `review` | `review` | Read-only station review of a pushed branch |
| `flow` | `flow` (Flow Lite) | Target-project alignment only |

Flow provides engineering judgment inside Foreman stations; it is not a second workflow engine. When refreshing, compare against these upstream sections and update the commit above.
