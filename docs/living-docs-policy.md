# Living Docs Policy

## Purpose

Docs must evolve with the backend. This prevents architecture, auth, data, cache, and workflow drift as the application grows.

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

## Docs Can Stay Unchanged

Docs can stay unchanged for:

- isolated typo fixes
- test-only changes that do not alter expected behavior
- internal implementation refactors with no behavior, structure, workflow, or public contract change

When docs are not updated, mention why in the final response or PR notes.

## Source Of Truth

- `AGENTS.md`: agent contract and non-negotiable rules.
- `docs/backend-guidelines.md`: general backend standards.
- `docs/feature-checklist.md`: completion checklist.
- Topic docs: architecture, database, cache, security, core, hooks, skills.

## Enforcement

Guardrails warn when backend source changes without docs changes. This starts as warning-only and can become a failure after the workflow stabilizes.
