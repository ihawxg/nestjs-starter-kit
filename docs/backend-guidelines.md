# Backend Guidelines

## Purpose

These guidelines keep backend work consistent while Townhall Manipulicity moves from starter-kit baseline to product backend.

The backend must support two clear access paths:

- Admin management for trusted operators.
- Public browsing and downloads for website visitors.

Authenticated accounts are admin-only. Public website visitors are anonymous; do not add public profiles, public login, or public registration without a deliberate product change.

These rules are backed by executable guardrails. Run `npm run guardrails` from `api/` for the structural checks, `npm run verify` for normal backend changes, and `npm run verify:full` for auth, route, database, migration, cache, storage, or integration changes.

Do not run dev servers, Docker environment startup, production start commands, or builds as routine completion checks. Use guardrails, lint, and tests unless the user explicitly asks for a dev/build/start command. Explicitly requested blocked commands must use `TOWNHALL_ALLOW_DEV_BUILD=1`.

## Architecture

Use NestJS domain modules. Each major civic data area should own its controller, service, DTOs, entity, tests, and migrations.

Expected module shape:

```text
api/src/<domain>/
  dto/
  entities/
  services/
  <domain>.controller.ts
  <domain>.module.ts
  <domain>.controller.spec.ts
```

Keep shared helpers small. Move code to shared/global modules only when more than one domain truly needs it.

Boundary rules:

- Domain modules own their business behavior.
- Cross-domain imports should go through module providers, not deep relative paths.
- Avoid imports that climb through multiple parent folders; the current ESLint config blocks `../../../*`.
- Keep infrastructure modules (`db`, `global`, `logger`, `app-cache`, `health`) focused on infrastructure.
- Do not move starter-kit infrastructure during feature work unless the feature requires it.
- New non-infrastructure source folders with TypeScript code must include a matching module file and follow the domain folder layout.
- Empty experimental directories may exist temporarily, but adding TypeScript code to them turns them into domains and guardrails apply.

Controller responsibilities:

- Define route paths and HTTP methods.
- Attach guards and interceptors.
- Accept DTOs and validated query parameters.
- Return documented response shapes.
- Avoid business branching that belongs in services.

Service responsibilities:

- Enforce business rules.
- Call repositories/storage/mail/cache abstractions.
- Keep public filtering rules centralized.
- Avoid returning private fields to controllers unless needed for protected behavior.

Entity responsibilities:

- Match persisted schema.
- Stay aligned with migrations.
- Avoid API-only validation and response formatting.

## Access Model

Admin accounts:

- Create records.
- Update records.
- Delete or archive records.
- Manage publishing state.
- Manage document metadata and file lifecycle.
- Manage other admin accounts.

Anonymous public visitors:

- Read public/published records.
- Download public documents.
- Search/filter public data when supported.

Anonymous users should be treated as public visitors. Admin routes must require authentication and role authorization.

## Authentication

Current role implementation:

- Users have `admin` or `public` role.
- JWT payload carries role.
- Public registration is disabled.
- First admin is created or promoted through `npm run admin:create`.
- Login is admin-only: disabled accounts and legacy non-admin rows are rejected.
- The physical table remains `users` for now; public API language should use admin accounts, not public users.

Admin write routes are blocked until all are true:

- Route requires JWT authentication.
- Route checks admin role.
- Tests cover anonymous denial.
- Tests cover legacy public/non-admin denial.
- Tests cover admin success path or controller/service equivalent.

## API Design

Use separate paths or clearly separate handlers for admin and public behavior. Do not make one route change behavior based on hidden role logic unless response shape is identical and safe.

Recommended pattern:

- Public reads: `GET /<domain>` and `GET /<domain>/:id`
- Admin writes: protected `POST`, `PATCH`, `DELETE` routes
- Current civic management routes use `/admin/<domain>` for a visible admin boundary.

Use DTOs for all request bodies and query parameters that need validation. Keep response shapes stable and documented in Swagger.

Public route rules:

- Return only published public data.
- Filter unpublished/private/draft records at service or repository level.
- Do not accept role, owner, published status, or admin-only filters from public request bodies.
- Do not leak storage keys, password hashes, tokens, stack traces, or internal paths.

Admin route rules:

- Use explicit write DTOs.
- Validate all body fields.
- Keep destructive operations intentional and tested.
- Prefer archive/unpublish behavior when product semantics are not final.
- Include admin list/detail read paths when a domain has draft or archived states, so admin UIs do not depend on public routes.

Current admin read pattern:

- `GET /admin/<domain>?page&limit&status`
- `GET /admin/<domain>/:id`

Current admin account routes:

- `GET /admin/accounts?page&limit&status`
- `GET /admin/accounts/:id`
- `POST /admin/accounts`
- `PATCH /admin/accounts/:id`

Admin-created accounts are always admin accounts. Use `isActive` to disable login without deleting history.

## Audit Logs And Rate Limits

Admin write routes should be audit logged with explicit `@Audit(...)` metadata. Audit metadata must be safe:

- actor account id/email
- action
- target type/id
- request id
- route/method-level metadata only

Never log passwords, tokens, storage keys, local filesystem paths, or raw uploaded file paths.

Use `@RateLimit(...)` metadata for throttled routes:

- login: `RateLimitBucket.LOGIN`
- public reads/downloads/search: `RateLimitBucket.PUBLIC`
- admin writes: `RateLimitBucket.ADMIN_WRITE`

Defaults come from `.env` and `api/src/services/app-config/configuration.ts`.

## Database

Use TypeORM entities and migrations together. A schema change is incomplete without a migration.

Migration rules:

- Name migrations after the feature or table change.
- Keep `up` and `down` paths reversible where practical.
- Add indexes for public lookup fields and admin list filters.
- Keep published/draft/private state queryable.

Schema guardrails:

- Do not rely on `synchronize` for schema changes.
- Do not edit old migrations after they have been applied in a shared environment.
- Do not add nullable fields as a shortcut unless the domain actually allows missing data.
- Keep unique constraints explicit for slugs, emails, and other natural identifiers.

## Documents And Downloads

Document records should store metadata in PostgreSQL:

- title
- description
- scoped category assignments
- storage key/path
- filename
- mime type
- file size
- published state
- created/updated timestamps

File bytes should live behind a storage abstraction. Do not store file blobs in PostgreSQL unless this decision is explicitly changed.

Current local upload behavior:

- File bytes are stored under the configured local upload directory.
- File metadata is stored in PostgreSQL.
- News and documents may have multiple attached assets.
- Public APIs may return safe file metadata only.
- Public APIs must never return storage keys or local filesystem paths.

Public downloads must only serve published public files.

## Categories

Categories are managed backend data, not arbitrary free-text fields.

- Categories are scoped by domain, currently `news` or `documents`.
- Category slugs are unique per scope.
- Public category lists return active categories only.
- Public content filters must ignore inactive categories.
- Admin delete behavior should deactivate categories unless hard delete is explicitly required.

## Events

Event records should support public upcoming/current lists and admin management of draft, published, and archived records.

- Public event lists return published current or upcoming events.
- Admin event lists may include draft, published, and archived events.
- Event time windows must have `endsAt` at or after `startsAt`.

## Departments And Contacts

Department records should support public contact discovery and admin management of draft, published, and archived records.

- Public department lists return published departments only.
- Public department reads include active contacts only.
- Contacts belong to exactly one department.
- Contact delete behavior should deactivate contacts unless hard delete is explicitly required.
- Department delete behavior should archive the department.

## Public Search

Public search is a safe summary endpoint across published news, documents, events, and departments.

- Route: `GET /search?q&page&limit&type`.
- Search only published records.
- Return compact summaries only.
- Do not return draft/archived records, disabled contacts, storage metadata, or admin/account data.

## Validation And Errors

Use `class-validator` DTOs. Reject malformed input at the controller boundary.

Error responses should not leak private data, internal paths, stack traces, tokens, or storage keys.

DTO guardrails:

- Create separate DTOs for create, update, and query behavior when validation differs.
- Do not reuse entities as request DTOs.
- Do not trust client-supplied ids for authenticated user, role, ownership, or publication state.

## Tests

For new backend features, add targeted tests:

- Controller request/response behavior.
- Service business rules.
- DTO validation when meaningful.
- Admin guard and role denial behavior.
- Public read/download behavior.
- Migration-backed entity fields when schema changes are risky.

Run at minimum:

```console
npm run guardrails
npm run verify
```

Run `npm run verify:full` for route, auth, database, or integration changes.

Use `npm run lint-ci` when a quick non-mutating lint/type gate is enough. Avoid `npm run lint` as the default verification command because it writes fixes.

Avoid `npm run build`, `npm run start:dev`, `npm run dev`, `npm start`, `nest build`, `nest start`, and `docker-compose up` after normal code completion. These commands can disrupt the user's active environment. If the user explicitly asks for one, run it with `TOWNHALL_ALLOW_DEV_BUILD=1`.

Expected coverage by change type:

- Docs only: validate links, commands, and paths manually.
- DTO/controller/service change: `npm run verify`.
- Auth, route, database, migration, cache, or storage change: `npm run verify:full`.
- New public endpoint: include published/unpublished visibility tests.
- New admin endpoint: include anonymous, public/non-admin, and admin behavior tests.

## Documentation

Update docs in the same change when behavior changes:

- `README.md` for setup, commands, ports, and project overview.
- `AGENTS.md` for durable agent instructions.
- `docs/domain-roadmap.md` for product scope and domain ordering.
- `docs/feature-checklist.md` for implementation guardrails and completion checks.
- `docs/architecture-standards.md` for module and boundary rules.
- `docs/core-module-policy.md` before creating app-wide shared providers.
- `docs/database-standards.md` for migrations, indexing, and query review.
- `docs/cache-standards.md` for Redis key, TTL, and invalidation rules.
- `docs/security-standards.md` for auth, role, public data, and file safety.
- `docs/codex-skill-routing.md` for external skill usage.
