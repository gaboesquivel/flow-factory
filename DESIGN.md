# Design

Flow Factory has no custom dashboard. Operators use:

- **GitHub** — issues, labels, draft pull requests, and CI on the target repository.
- **Eve dev TUI** — `pnpm dev` for local sessions; GitHub writes wait for approval in the TUI when untrusted.

Progress appears as issue comments during unattended runs and as a final summary with the draft PR link.

Visual and interaction design for a future Flow dashboard are out of scope for this milestone; GitHub and Eve are the operator surfaces.
