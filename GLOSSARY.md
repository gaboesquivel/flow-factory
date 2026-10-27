# Glossary

| Term            | Meaning                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------ |
| **Task**        | A GitHub Issue (`owner/repo#number`). No parallel local backlog.                           |
| **Foreman**     | Coordinator inside the local service; routes work, does not bypass reservations or limits. |
| **Run**         | One delegated execution attempt with persisted status and evidence.                        |
| **Handoff**     | Durable context so another client can continue without private chat transcripts.           |
| **Reservation** | Exclusive claim on a task for one writer.                                                  |
| **Adapter**     | Execution backend (`cursor`, `ollama`). Enabled only when probed successfully.             |
