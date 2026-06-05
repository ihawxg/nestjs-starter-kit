# Living Docs Policy

## Purpose

Docs must evolve with the backend and frontend. This prevents architecture, auth, data, cache, UI, routing, and workflow drift as the application grows.

## Update Docs In The Same Change

Update docs when changing:

- public/admin API behavior
- auth, roles, guards, or permissions
- schema, migrations, entities, indexes, or query policy
- domain roadmap or product scope
- cache, Redis keys, TTLs, or invalidation
- storage, files, uploads, or downloads
- verification commands, hooks, or guardrails
- module architecture, shared code, or core policy
- installed skills or Codex routing
- frontend route structure, design system usage, API generation, localization, auth strategy, or verification commands
- project skill registry, skill install/verify workflow, or routed skills

## Docs Can Stay Unchanged

Docs can stay unchanged for:

- isolated typo fixes
- test-only changes that do not alter expected behavior
- internal implementation refactors with no behavior, structure, workflow, or public contract change

When docs are not updated, mention why in the final response or PR notes.

## Source Of Truth

- `AGENTS.md`: agent contract and non-negotiable rules.
- `docs/backend-guidelines.md`: general backend standards.
- `docs/frontend-architecture.md`: frontend structure and rendering standards.
- `docs/frontend-guidelines.md`: frontend coding, API, security, and design-system standards.
- `docs/feature-checklist.md`: completion checklist.
- `docs/frontend-feature-checklist.md`: frontend completion checklist.
- Topic docs: architecture, database, cache, security, core, hooks, skills.

## Enforcement

Guardrails warn when backend or frontend source changes without docs changes. This starts as warning-only and can become a failure after the workflow stabilizes.
