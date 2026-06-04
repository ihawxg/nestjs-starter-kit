# AGENTS.md

## Project

Townhall Manipulicity backend is a NestJS REST API for public municipal website data and protected admin management flows.

Use this file as durable guidance for Codex CLI and other coding agents working in this repository.

## Current Stack

- API lives in `api/`.
- Framework: NestJS.
- Database: PostgreSQL through TypeORM.
- Cache: Redis through Nest cache manager.
- Auth: JWT/passport baseline exists.
- API docs: Swagger at `/api`.
- Local dependencies live in `.docker-node-api/docker-compose.yml`.

## Product Rules

- Admin users can create, update, delete, and manage backend data.
- Public users can only read published data and download public files.
- Do not add public admin registration.
- First admin account must be created by seed, migration, or CLI script.
- Treat existing user registration as starter-kit behavior until role work is implemented.
- Never expose unpublished, private, draft, or admin-only data through public endpoints.

## Backend Feature Rules

Executable guardrails are part of the project contract. Run `npm run guardrails` from `api/`, or `npm run verify` for normal backend changes. Codex project hooks also run guardrails around edits when `.codex/hooks.json` is trusted.

Non-negotiable rules:

- Preserve the domain module structure under `api/src/<domain>`.
- Do not create giant shared services or controllers for unrelated domains.
- Do not change database schema without a TypeORM migration.
- Do not expose an admin write endpoint without JWT auth, role guard coverage, and tests proving public/anonymous users are denied.
- Do not expose public endpoints that can return unpublished, private, draft, or admin-only data.
- Do not loosen ESLint, TypeScript, validation, or test settings without a clear project reason in the same change.

Every new backend feature must include:

- Domain module, controller, service, DTOs, and entity where needed.
- DTO validation for incoming requests.
- Swagger decorators for public API shape.
- TypeORM migration for schema changes.
- Unit tests for controller/service logic.
- Guard/role tests for admin-only endpoints.
- Public read tests when feature has public endpoints.

Keep modules domain-based. Do not build a giant shared controller or service for unrelated data.

Controller/service boundary:

- Controllers handle routing, guards, request DTOs, response shape, and Swagger metadata.
- Services handle business rules and repository calls.
- Entities model persistence only; do not put request validation or controller response shaping in entities.
- DTOs define API input, not database state.
- Tests should cover behavior, not private implementation details.

## Auth And Authorization

- Use JWT authentication for protected routes.
- Add role-based guards before exposing admin write routes.
- Admin-only routes must fail for public/anonymous users.
- Public read routes must be explicit and must return only published public data.
- Do not trust role, user id, or ownership values from request bodies.

## Data And Storage

- Use TypeORM migrations for all database changes.
- Keep entities aligned with migrations.
- Store document/file metadata in PostgreSQL.
- Do not store uploaded document blobs in PostgreSQL unless project direction changes.
- Use a storage layer for files so local, S3, or another provider can be swapped later.

## Commands

Run API commands from `api/`.

```console
npm run guardrails
npm run verify
npm run verify:full
```

Use `npm run verify` for backend code changes. Use `npm run verify:full` for auth, route, database, or integration changes. Use `npm run lint-ci` for a non-mutating lint/type check. Avoid `npm run lint` as the default verification command because it applies `--fix`.

Local dependency startup:

```console
cd .docker-node-api
docker-compose up -d
```

Migration commands:

```console
npm run migrations:new -- src/db/migrations/FeatureName
npm run migrations:up
npm run migrations:revert
```

## Documentation

- Update `README.md` when setup, commands, ports, or top-level project behavior changes.
- Update `docs/backend-guidelines.md` when architecture or backend conventions change.
- Update `docs/domain-roadmap.md` when v1 civic data scope changes.
- Use `docs/feature-checklist.md` before and after feature implementation.
- If Codex CLI reports project hooks need review, run `/hooks` and trust the checked-in project guardrail hooks after reviewing them.

## Working Rules

- Prefer existing NestJS patterns in this repo before adding new abstractions.
- Keep changes small and domain-scoped.
- Do not rewrite unrelated starter-kit infrastructure during feature work.
- Do not commit generated build output, local env secrets, caches, or dependency folders.
- Before finishing code changes, run the narrowest useful checks and report anything not run.
- If guardrails conflict with a requested change, stop and surface the conflict before editing.
