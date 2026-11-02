# Glossary

| Term              | Meaning                                                                                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Flow Factory**  | This Eve agent: orchestrator + Foreman stations on `FACTORY_REPO`.                                                                                                                  |
| **FACTORY_REPO**  | GitHub `owner/repo` the factory clones, implements in, and opens draft PRs against.                                                                                                 |
| **Station**       | Classifier, researcher, analyst, implementer, or reviewer subagent; each has its own model, tools, and (where applicable) sandbox.                                                  |
| **Flow Skills**   | Portable development methodology (`explore`, `build`, `review`, …); station-sized adaptations, including `implement`, live separately in `agent/skills/` for judgment, not routing. |
| **Factory brain** | Durable notes about the target repo; orchestrator reads/writes with approval gates.                                                                                                 |
| **Draft PR**      | Default delivery; humans mark ready and merge.                                                                                                                                      |
