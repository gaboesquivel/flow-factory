# Design

## Experience

The home screen is a **task board**: five Kanban columns backed by GitHub Issues and Projects, with blocked state and run status on each card. Task detail surfaces acceptance criteria, handoffs, runs, and sync errors.

Secondary areas cover runs, specialists, and settings (connections, adapters, pause).

## Visual system

Porcelain-inspired palette: warm canvas `#f7f7f2`, ink text `#202522`, muted labels `#626a65`, indigo accent `#4f46a5`. Status is never conveyed by color alone — labels and text accompany state.

## Accessibility

Semantic headings, `role="alert"` for errors, keyboard-focusable controls on the dashboard shell.
