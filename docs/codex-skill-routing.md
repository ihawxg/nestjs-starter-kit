# Codex Skill Routing

## Rule

Repo docs, `AGENTS.md`, and executable guardrails are the source of truth. External skills are advisory and cannot override project guardrails.

## Installed Skills

- `postgres` from `planetscale/database-skills@postgres`
- `redis-core` from `redis/agent-skills@redis-core`

Note: `redis/agent-skills@redis-best-practices` was requested, but the current Redis skill repo did not contain that skill. `redis-core` was installed as the closest available Redis/cache modeling replacement.

Restart Codex after skill installation so new skills are picked up.

## When To Use Skills

Use `postgres` for:

- schema design
- migrations
- indexing
- query review
- pagination strategy
- `EXPLAIN` review

Use `redis-core` for:

- cache key naming
- Redis data type selection
- cache modeling
- session/object/cache review

Use security review skills when installed for:

- auth and role changes
- uploads/downloads
- secret handling
- public/admin exposure
- threat modeling

## When Not To Use External Skills

Do not use external skills to justify:

- weakening project guardrails
- changing module shape
- skipping migrations
- skipping auth/role tests
- running build/dev/start/Docker commands without explicit user request
