# Backend Guidelines

## Purpose

These guidelines keep backend work consistent while Townhall Manipulicity moves from starter-kit baseline to product backend.

The backend must support two clear access paths:

- Admin management for trusted operators.
- Public browsing and downloads for website visitors.

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

Admin role:

- Create records.
- Update records.
- Delete or archive records.
- Manage publishing state.
- Manage document metadata and file lifecycle.

Public role:

- Read public/published records.
- Download public documents.
- Search/filter public data when supported.

Anonymous users should be treated as public visitors. Admin routes must require authentication and role authorization.

## Authentication

JWT auth already exists in starter form. Role support still needs implementation.

When implementing roles:

- Add explicit role field or role relation to users.
- Default new non-seeded users to non-admin if registration remains available.
- Prefer seeded or scripted first-admin creation.
- Keep role checks server-side only.
- Add tests proving public users cannot call admin write endpoints.

Admin write routes are blocked until all are true:

- Route requires JWT authentication.
- Route checks admin role.
- Tests cover anonymous denial.
- Tests cover public/non-admin denial.
- Tests cover admin success path or controller/service equivalent.

## API Design

Use separate paths or clearly separate handlers for admin and public behavior. Do not make one route change behavior based on hidden role logic unless response shape is identical and safe.

Recommended pattern:

- Public reads: `GET /<domain>` and `GET /<domain>/:id`
- Admin writes: protected `POST`, `PATCH`, `DELETE` routes

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
- category or domain owner
- storage key/path
- filename
- mime type
- file size
- published state
- created/updated timestamps

File bytes should live behind a storage abstraction. Do not store file blobs in PostgreSQL unless this decision is explicitly changed.

Public downloads must only serve published public files.

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
