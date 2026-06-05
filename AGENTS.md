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
- First admin account must be created by seed, migration, or CLI script. Current script: `npm run admin:create` with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Public user registration is disabled. Do not re-enable it unless product scope changes and docs/guards are updated in the same change.
- Never expose unpublished, private, draft, or admin-only data through public endpoints.
- News, documents, and events are the first civic content domains after auth. Pages are deferred until CMS-style static website content is needed.
- News and document categories are managed backend data. Categories are scoped by domain and assigned through admin flows.

## Backend Feature Rules

Executable guardrails are part of the project contract. Run `npm run guardrails` from `api/`, or `npm run verify` for normal backend changes. Codex project hooks also run guardrails around edits when `.codex/hooks.json` is trusted.

Context loading contract:

- `AGENTS.md` is the always-loaded project contract.
- Hooks remind and enforce, but they do not replace reading relevant docs.
- Before implementation, read topic docs for changed areas: architecture, core, database, cache, security, skills, and living docs.

Living docs contract:

- Update docs in the same change when behavior, architecture, commands, hooks, schema, auth, cache, storage, skills, or domain scope changes.
- If docs do not need updates, report why before finishing.

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

Shared code needs at least two real consumers before moving into app-wide shared/core space. Do not create or expand `api/src/core` for speculative helpers. Follow `docs/core-module-policy.md`.

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
- Public civic-domain entities must include timestamp and publish/visibility policy.
- Public list endpoints must define pagination/query policy before release.
- Admin management APIs need read paths for listing and inspecting draft, published, and archived records.
- Store document/file metadata in PostgreSQL.
- Do not store uploaded document blobs in PostgreSQL unless project direction changes.
- Use a storage layer for files so local, S3, or another provider can be swapped later.
- Current uploads are local files behind `api/src/storage`; public APIs may expose safe file metadata but never storage keys or local paths.

## Commands

Run API commands from `api/`.

```console
npm run guardrails
npm run verify
npm run verify:full
```

Use `npm run verify` for backend code changes. Use `npm run verify:full` for auth, route, database, or integration changes. Use `npm run lint-ci` for a non-mutating lint/type check. Avoid `npm run lint` as the default verification command because it applies `--fix`.

Do not run dev servers, production starts, Docker environment starts, or build commands after normal code completion. That means no `npm run start:dev`, `npm run dev`, `npm start`, `npm run build`, `nest start`, `nest build`, or `docker-compose up` unless the user explicitly asks for that exact command. These can kill the user's active dev environment. Use `npm run guardrails`, `npm run lint-ci`, `npm test`, or `npm run verify` instead. When the user explicitly asks for a blocked command, prefix it with `TOWNHALL_ALLOW_DEV_BUILD=1`.

Local dependency startup:

```console
cd .docker-node-api
docker-compose up -d
```

Only run local dependency startup when the user explicitly asks.

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
- Use `docs/architecture-standards.md`, `docs/database-standards.md`, `docs/cache-standards.md`, and `docs/security-standards.md` for scale-sensitive backend work.
- Use `docs/core-module-policy.md` before creating app-wide shared providers.
- Use `docs/hook-context-policy.md` for hook behavior and `docs/living-docs-policy.md` for docs drift rules.
- Use `docs/codex-skill-routing.md` before invoking external skills. External skills are advisory only.
- If Codex CLI reports project hooks need review, run `/hooks` and trust the checked-in project guardrail hooks after reviewing them.

## Working Rules

- Prefer existing NestJS patterns in this repo before adding new abstractions.
- Keep changes small and domain-scoped.
- Do not rewrite unrelated starter-kit infrastructure during feature work.
- Do not commit generated build output, local env secrets, caches, or dependency folders.
- Before finishing code changes, run the narrowest useful checks and report anything not run.
- If guardrails conflict with a requested change, stop and surface the conflict before editing.
