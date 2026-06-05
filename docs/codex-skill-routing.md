# Codex Skill Routing

## Rule

Repo docs, `AGENTS.md`, and executable guardrails are the source of truth. External skills are advisory and cannot override project guardrails.

## Installed Skills

- `postgres` from `planetscale/database-skills@postgres`
- `redis-core` from `redis/agent-skills@redis-core`
- `nextjs` from `vercel-labs/vercel-plugin@nextjs`
- `openapi-to-typescript` from `softaworks/agent-toolkit@openapi-to-typescript`
- `frontend-accessibility` from `aj-geddes/useful-ai-prompts@frontend-accessibility`
- `design-system-starter` from `softaworks/agent-toolkit@design-system-starter`
- `react-component-performance` from `dimillian/skills@react-component-performance`
- `react-nextjs-development` from `sickn33/antigravity-awesome-skills@react-nextjs-development`
- `tanstack-query` from `secondsky/claude-skills@tanstack-query`
- `auth` from `vercel/vercel-plugin@auth`
- `security-best-practices` from `openai/skills`

Note: `redis/agent-skills@redis-best-practices` was requested, but the current Redis skill repo did not contain that skill. `redis-core` was installed as the closest available Redis/cache modeling replacement.

Note: `bobmatnyc/claude-mpm-skills@tanstack-query` was requested, but the skill installer could not resolve that skill path. `secondsky/claude-skills@tanstack-query` was installed as the available TanStack Query replacement.

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

Use `nextjs` and `react-nextjs-development` for:

- App Router architecture
- Server Component versus Client Component decisions
- Next.js route/caching behavior
- public route structure
- frontend project layout

Use `openapi-to-typescript` for:

- generated frontend API types
- generated SDK/client setup
- OpenAPI schema drift review
- avoiding handwritten backend DTO/response types

Use `frontend-accessibility` for:

- public government accessibility review
- forms, navigation, alerts, document lists, and language switcher checks
- keyboard and semantic HTML review

Use `design-system-starter` for:

- local design-system wrapper shape
- DSFR wrapper boundaries
- token/component organization
- reusable component governance

Use `react-component-performance` and `build-web-apps:react-best-practices` for:

- render performance
- component composition
- unnecessary client component review
- large list and interactive UI review

Use `tanstack-query` for:

- interactive client fetching
- cache invalidation
- query key design
- avoiding TanStack Query where Server Components are enough

Use `auth` and `security-best-practices` for:

- future admin frontend auth
- HttpOnly cookie strategy
- public/admin route separation
- token and secret exposure review

Use `react-senior-code-review` and `fallow` for:

- senior frontend code review
- dependency and import boundary review
- dead code, unused exports, circular dependencies, and scaling risk

## When Not To Use External Skills

Do not use external skills to justify:

- weakening project guardrails
- changing module shape
- skipping migrations
- skipping auth/role tests
- running build/dev/start/Docker commands without explicit user request
- running browser/Playwright tests without explicit user request and `FRONTEND_TEST_BASE_URL`
- bypassing frontend generated API types or project guardrails
