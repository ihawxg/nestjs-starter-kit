# Feature Checklist

Use this checklist before and after backend feature work. It is meant for Codex, other agents, and human review.

## Before Coding

- Read `AGENTS.md`, `docs/backend-guidelines.md`, and `docs/domain-roadmap.md`.
- Identify the domain module under `api/src/<domain>`.
- Confirm whether the change affects public reads, admin writes, auth, database schema, files, cache, mail, or logging.
- Check existing module patterns before adding new abstractions.
- Keep scope domain-specific. Do not refactor unrelated starter-kit infrastructure.
- Run `npm run guardrails` from `api/` if you need a quick baseline before editing.

## Implementation Checklist

- Domain code stays under its module.
- Shared/core code has at least two real consumers and follows `docs/core-module-policy.md`.
- Controller handles routing, guards, DTOs, and Swagger metadata.
- Service handles business rules and persistence/storage calls.
- DTOs validate all request bodies and meaningful query parameters.
- Entities match TypeORM migrations.
- Public domain entities include timestamps and publish/visibility state.
- Public endpoints return only published public data.
- Public list endpoints define pagination/query policy.
- Admin write endpoints require JWT auth and admin role checks.
- Admin-only endpoints use `JwtAuthGuard`, `RolesGuard`, and `@Roles(UserRole.ADMIN)`.
- Admin write endpoints include `@RateLimit(RateLimitBucket.ADMIN_WRITE)` and audit metadata where they mutate backend data.
- Admin-managed draft/archive domains expose protected list/detail read paths for admin UIs.
- Authenticated account flows are admin-only; do not add public user registration, public profiles, or public login.
- Disabled admin accounts and legacy non-admin rows cannot log in.
- File metadata lives in PostgreSQL; file bytes go through a storage layer.
- Categories are managed records, scoped by domain, and assigned through admin flows.
- Public category filters use active categories only.
- Public department responses include active contacts only.
- Public search returns published civic summaries only and no storage/admin metadata.
- Public read/download/search endpoints include public rate-limit metadata.
- No secrets, tokens, password hashes, stack traces, storage keys, or internal paths are returned by public APIs.
- No secrets, tokens, password hashes, storage keys, local paths, or raw upload paths are written to audit logs.

## Database Checklist

- Every schema change has a TypeORM migration.
- Migration `up` and `down` paths are included where practical.
- Entity fields match migration columns.
- Slugs, emails, and natural identifiers have explicit uniqueness when needed.
- Public list/filter fields have indexes when data volume can grow.

## Test Checklist

- Controller tests cover request/response behavior.
- Service tests cover business rules.
- Public endpoints test published data visibility.
- Public endpoints test unpublished/private data exclusion.
- Admin endpoints test anonymous denial.
- Admin endpoints test legacy public/non-admin denial.
- Admin endpoints test admin success path.
- Admin account tests cover create, update, list, disabled login denial, and non-admin login denial.
- Audit log tests cover representative writes and metadata sanitization.
- Search tests cover published-only results.
- Rate-limit tests cover configured buckets where practical.
- Auth, route, database, migration, cache, or storage changes run full verification.

## Documentation Checklist

- Update `README.md` when setup, commands, ports, or project overview changes.
- Update `AGENTS.md` when durable agent rules change.
- Update `docs/backend-guidelines.md` when architecture rules change.
- Update `docs/domain-roadmap.md` when v1 product scope changes.
- Update this checklist when completion criteria change.

## Docs Drift Check

Update docs in the same change when backend behavior, architecture, commands, hooks, schema, auth, cache, storage, installed skills, or domain scope changes.

If docs stay unchanged, record why in the final response or PR notes.

## Verification Commands

Run from `api/`.

Structural guardrails:

```console
npm run guardrails
```

Docs-only changes:

```console
npm run lint-ci
```

Backend code changes:

```console
npm run verify
```

Auth, route, database, migration, cache, storage, or integration changes:

```console
npm run verify:full
```

Do not run these commands unless the user explicitly asks for them:

```console
npm run build
npm run start:dev
npm run dev
npm start
nest build
nest start
docker-compose up
```

When explicitly requested, prefix the command with `TOWNHALL_ALLOW_DEV_BUILD=1` so Codex project hooks know the command is intentional.

## Blocked Until Fixed

Do not finish a backend feature while any of these are true:

- Public route can return unpublished, private, draft, or admin-only data.
- Admin write route lacks JWT auth or admin role checks.
- Admin route lacks anonymous/public denial tests.
- Schema changed without a migration.
- Entity and migration disagree.
- Request body uses entity class instead of DTO.
- Validation is missing for user-controlled input.
- Test or lint strictness was loosened without explicit project reason.
- New shared abstraction hides unrelated domain behavior.
- Verification was skipped without reporting why.
- `npm run guardrails` fails.
- A dev server, build, Docker startup, or production start command was run without explicit user request.
- Backend source changed and docs were not updated or explicitly marked not needed.
