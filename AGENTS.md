# AGENTS.md

## Project

Townhall Manipulicity is a municipal website project with a NestJS backend API and a planned Next.js public frontend.

Use this file as durable guidance for Codex CLI and other coding agents working in this repository.

## Current Stack

- API lives in `api/`.
- Backend framework: NestJS.
- Database: PostgreSQL through TypeORM.
- Cache: Redis through Nest cache manager.
- Auth: JWT/passport baseline exists.
- API docs: Swagger at `/api`.
- Local dependencies live in `.docker-node-api/docker-compose.yml`.
- Frontend will live in `frontend/` beside `api/`.
- Frontend framework decision: Next.js App Router with TypeScript.
- Frontend public routes will use `en` and `bg` locale prefixes.
- Frontend backend types must be generated from backend OpenAPI.
- Project skill registry: `.codex/project-skills.json`.
- Project skills are manifest-only; do not vendor third-party skill folders in git.

## Product Rules

- Admin accounts can create, update, delete, and manage backend data.
- Anonymous public visitors can only read published data, search public data, and download public files.
- Do not add public admin registration.
- First admin account must be created by seed, migration, or CLI script. Current script: `npm run admin:create` with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Public user registration is disabled. Do not add public accounts unless product scope changes and docs/guards are updated in the same change.
- Authenticated accounts are admin-only. Legacy non-admin rows in the `users` table must not be able to log in or call admin routes.
- Never expose unpublished, private, draft, or admin-only data through public endpoints.
- News, documents, events, departments, contacts, pages, site settings, navigation, alerts, media, staff, officials, and committees are core civic website domains after auth.
- Public civic content is bilingual: English default (`en`) and Bulgarian (`bg`). Public localized routes use path prefixes such as `/bg/news` and `/en/news`; unprefixed routes remain English aliases.
- Auto-translation is supported through the localization module when explicitly configured. Current provider target: DeepL for English/Bulgarian. Generated translations are auto-published but remain admin-overridable.
- News and document categories are managed backend data. Categories are scoped by domain and assigned through admin flows.
- Do not seed or hardcode municipality pages, labels, navigation items, or category content unless the user explicitly requests content seeding.
- Platform hardening includes audit logs, rate limits, admin account lifecycle, and public search.

## Backend Feature Rules

Executable guardrails are part of the project contract. Run `npm run guardrails` from `api/`, or root `npm run guardrails` for project-wide guardrails. Use `npm run verify` for normal backend changes. Codex project hooks also run guardrails around edits when `.codex/hooks.json` is trusted.

Context loading contract:

- `AGENTS.md` is the always-loaded project contract.
- Hooks remind and enforce, but they do not replace reading relevant docs.
- Before implementation, read topic docs for changed areas: backend architecture, frontend architecture, core, database, cache, security, skills, hooks, and living docs.

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

## Frontend Feature Rules

Do not scaffold or expand the frontend without following `docs/frontend-architecture.md`, `docs/frontend-guidelines.md`, `docs/frontend-feature-checklist.md`, and `docs/dsfr-usage-policy.md`.

Non-negotiable frontend rules:

- Use Next.js App Router only. Do not add the Pages Router.
- Keep frontend source under `frontend/src`.
- Public locale routing must live under `frontend/src/app/[locale]` and support only `en` and `bg` until scope changes.
- Public frontend code must not call `/admin/...`.
- Backend API types and SDK code must be generated from backend OpenAPI. Do not handwrite backend DTO, entity, response, or payload types in frontend code.
- Backend calls must go through generated API code or approved wrappers under `frontend/src/lib/api`.
- Do not store JWTs or auth state in `localStorage` or `sessionStorage`.
- Future admin frontend auth must use HttpOnly cookies only.
- DSFR imports must go through local design-system wrappers/providers. Do not scatter direct DSFR imports through routes or feature components.
- Do not hardcode municipality pages, navigation, categories, departments, staff, officials, or public content.
- Public frontend must not render storage keys, local paths, tokens, password hashes, stack traces, draft data, or admin metadata.
- Frontend tests use Vitest and React Testing Library with colocated `*.spec.ts` or `*.spec.tsx` files for helpers, API wrappers, components, features, and public routes.
- Browser/Playwright-style tests are explicit only and never part of routine frontend `verify`.

Frontend shared code needs at least two real consumers before moving into shared UI or lib folders. Keep feature code domain-scoped under the route or feature it serves.

## Auth And Authorization

- Use JWT authentication for protected routes.
- Add role-based guards before exposing admin write routes.
- Admin-only routes must fail for anonymous visitors and legacy non-admin accounts.
- Login must deny disabled admin accounts and any non-admin account row.
- Public read routes must be explicit and must return only published public data.
- Do not trust role, user id, or ownership values from request bodies.

## Data And Storage

- Use TypeORM migrations for all database changes.
- Keep entities aligned with migrations.
- Public civic-domain entities must include timestamp and publish/visibility policy.
- Public list endpoints must define pagination/query policy before release.
- Admin management APIs need read paths for listing and inspecting draft, published, and archived records.
- Public department reads must return published departments and active contacts only.
- Public search must return safe summaries for published news, documents, events, and departments only.
- Public CMS routes must return only published pages, active settings, active navigation, and active alert windows.
- Public media routes must return safe file metadata only and never expose storage keys or local paths.
- Public people/governance routes must return only published staff, officials, and committees.
- Public localized responses must fall back to English when Bulgarian text is missing and include localization metadata.
- Admin translation writes may auto-generate the opposite locale when auto-translation is configured. Never commit provider keys. Machine translation metadata stays admin-only.
- Admin writes must be audit logged with safe metadata only; never log passwords, tokens, storage keys, local paths, or raw uploaded file paths.
- Rate limits are metadata-driven and configured through environment variables for login, public reads/downloads, and admin writes.
- Store document/file metadata in PostgreSQL.
- Do not store uploaded document blobs in PostgreSQL unless project direction changes.
- Use a storage layer for files so local, S3, or another provider can be swapped later.
- Current uploads are local files behind `api/src/storage`; public APIs may expose safe file metadata but never storage keys or local paths.

## Commands

Run project-wide commands from the repo root.

```console
npm run guardrails
npm run verify
```

Run API commands from `api/`.

```console
npm run guardrails
npm run verify
npm run verify:full
```

Use `npm run verify` for backend code changes. Use `npm run verify:full` for auth, route, database, or integration changes. Use `npm run lint-ci` for a non-mutating lint/type check. Avoid `npm run lint` as the default verification command because it applies `--fix`.

Do not run dev servers, production starts, Docker environment starts, build commands, or browser tests after normal code completion. That means no `npm run start:dev`, `npm run dev`, `npm run devs`, `npm start`, `npm run build`, `next dev`, `next build`, `next start`, `pnpm dev`, `pnpm build`, `pnpm start`, `yarn dev`, `yarn build`, `yarn start`, `bun dev`, `bun run build`, `turbo dev`, `turbo build`, `nest start`, `nest build`, `docker-compose up`, `docker compose up`, or Playwright/Cypress/browser-test commands unless the user explicitly asks for that exact command. These can kill the user's active dev environment. Use `npm run guardrails`, `npm run lint-ci`, `npm test`, `npm run type-check`, or `npm run verify` instead. When the user explicitly asks for a blocked dev/build/start command, prefix it with `TOWNHALL_ALLOW_DEV_BUILD=1`. When the user explicitly asks for browser tests, use `TOWNHALL_ALLOW_BROWSER_TEST=1` and `FRONTEND_TEST_BASE_URL=...`; do not start the dev server.

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
- Use `docs/localization-standards.md` before changing public text fields, localized routes, translation tables, or locale fallback behavior.
- Use `docs/frontend-architecture.md`, `docs/frontend-guidelines.md`, `docs/frontend-feature-checklist.md`, and `docs/dsfr-usage-policy.md` before adding frontend code.
- Restore shared project skills from upstream with `npm run skills:dry-run`, `npm run skills:install`, and `npm run skills:verify` from the repo root. Restart Codex after installing skills.
- If Codex CLI reports project hooks need review, run `/hooks` and trust the checked-in project guardrail hooks after reviewing them.

## Working Rules

- Prefer existing NestJS patterns in this repo before adding new abstractions.
- Keep changes small and domain-scoped.
- Do not rewrite unrelated starter-kit infrastructure during feature work.
- Do not commit generated build output, local env secrets, caches, or dependency folders.
- Before finishing code changes, run the narrowest useful checks and report anything not run.
- If guardrails conflict with a requested change, stop and surface the conflict before editing.
