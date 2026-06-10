# Townhall Manipulicity

Municipal website project for Townhall Manipulicity. The current implementation is a NestJS backend API for public civic data and protected admin management flows, plus a strict Next.js public frontend shell scaffold.

Current backend stack:

- NestJS REST API
- TypeORM
- PostgreSQL
- Redis cache
- JWT authentication
- Swagger API docs
- Pino request logging with trace IDs

Frontend stack:

- Next.js App Router
- React 19
- TypeScript
- Generated OpenAPI client/types
- Locale routes for English and Bulgarian
- Paraglide JS for frontend-owned UI translations
- Tailwind v4 utilities with a project-owned navy/gold civic design system
- `lucide-react` icons for public shell controls and civic affordances
- Zod-backed environment validation, rich-text sanitization, locale date formatting, and a small class-name helper
- TanStack Query and React Hook Form are installed for future interactive client fetching and forms, but public read pages should stay server-rendered by default
- Protected admin foundation under `/admin` with Mantine scoped to admin routes/components only

The codebase still contains starter-kit baseline modules. Treat them as infrastructure, not final product shape.

Current civic content work includes managed bilingual news, documents, events, departments, contacts, pages, site settings, navigation, alerts, media library files, staff, officials, committees, scoped categories, local file uploads, audit logs, rate limits, admin account lifecycle, and public search.

## Roles

- Admin accounts: can create, update, delete, and manage backend data.
- Anonymous public visitors: can read/search published data and download public files.

No public account registration is allowed. The first admin account must come from a seed, migration, or CLI script.

Admin management routes use `/admin/...` paths for current civic domains and `/admin/accounts` for admin account lifecycle. Public routes only return published content, safe media metadata, safe search summaries, and safe download metadata.

Public content supports English and Bulgarian. Use `/en/...` or `/bg/...` API prefixes for localized reads; existing unprefixed public routes are English aliases.

Admins can optionally auto-translate English/Bulgarian content through DeepL. Auto-translation is disabled by default and requires environment configuration; generated translations are auto-published and can be manually overridden.

CMS content is created through admin APIs only. There is no seed script or starter municipality content.

## Local Setup

Prerequisites:

- Docker Desktop
- Node.js LTS
- npm

Start local dependencies:

```console
cd .docker-node-api
docker-compose up -d
```

Install API dependencies:

```console
cd ../api
npm ci
```

Install workspace dependencies from the repo root after cloning:

```console
npm ci
```

Copy environment settings if needed:

```console
cp .env.example .env
```

Optional auto-translation settings:

```console
AUTO_TRANSLATION_ENABLED=false
AUTO_TRANSLATION_PROVIDER=deepl
DEEPL_AUTH_KEY=
DEEPL_TARGET_EN_VARIANT=en-US
AUTO_TRANSLATION_MAX_FIELD_BYTES=100000
```

Run migrations:

```console
npm run migrations:up
```

Start development server:

```console
npm run start:dev
```

## Local URLs

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api`
- Health: `http://localhost:3000/health`
- MailHog: `http://localhost:8025`
- PostgreSQL: `localhost:55432`
- Redis: `localhost:6379`

## Frontend

The public frontend lives in `frontend/`.

The global header/footer route menu is frontend-owned in `frontend/src/lib/navigation/public-navigation.ts`; it does not require backend navigation records to appear.

The protected admin dashboard foundation lives under `frontend/src/app/[locale]/admin`, with legacy redirects and a JSON `/admin/api/*` fallback under `frontend/src/app/admin`. Admin auth is backend-owned: Nest sets an HttpOnly admin session cookie plus a CSRF cookie, and admin browser calls go directly to backend `/admin/...` routes through approved credentialed wrappers. Mantine is allowed only for admin route/component files; public UI remains custom Tailwind/lucide.

Generate the frontend API client from the backend OpenAPI export without starting a dev server:

```console
npm run api:generate -w frontend
```

Compile frontend UI translations from `frontend/messages` without starting a dev server:

```console
npm run i18n:compile -w frontend
```

Run routine frontend checks:

```console
npm run guardrails -w frontend
npm run lint-ci -w frontend
npm test -w frontend
npm run verify -w frontend
```

Regenerate static public page design mockups without starting a frontend server:

```console
npm run design:mockups
```

Human-facing frontend lifecycle commands are available only through the frontend workspace:

```console
npm run dev -w frontend
npm run build -w frontend
npm run start -w frontend
```

Do not run frontend dev/build/start commands as routine checks or from Codex unless explicitly requested.

## Core Commands

Run project-wide guardrails from the repo root:

```console
npm run guardrails
npm run verify
npm run skills:dry-run
npm run skills:verify
```

Run backend commands from `api/`.

```console
npm run guardrails
npm run verify
npm run verify:full
```

Other useful commands:

```console
npm run lint-ci
npm test
npm run test:e2e
npm run admin:create
npm run lint
npm run type-check
npm run migrations:new -- src/db/migrations/ExampleName
npm run migrations:up
npm run migrations:revert
```

Do not run dev servers, Docker startup, production start, build commands, or browser tests as routine completion checks. Run `npm run build`, `npm run start:dev`, `npm run dev`, `npm start`, `next dev`, `next build`, `next start`, `docker-compose up`, or Playwright/browser commands only when explicitly requested.

Create or promote the first admin account:

```console
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='strong-password' npm run admin:create
```

## Documentation

- [Agent instructions](./AGENTS.md)
- [Backend guidelines](./docs/backend-guidelines.md)
- [Frontend architecture](./docs/frontend-architecture.md)
- [Frontend guidelines](./docs/frontend-guidelines.md)
- [Frontend feature checklist](./docs/frontend-feature-checklist.md)
- [Frontend design system policy](./docs/frontend-design-system-policy.md)
- [Admin dashboard guidelines](./docs/admin-dashboard-guidelines.md)
- [Retired DSFR usage policy](./docs/dsfr-usage-policy.md)
- [Domain roadmap](./docs/domain-roadmap.md)
- [Feature checklist](./docs/feature-checklist.md)
- [Architecture standards](./docs/architecture-standards.md)
- [Core module policy](./docs/core-module-policy.md)
- [Database standards](./docs/database-standards.md)
- [Cache standards](./docs/cache-standards.md)
- [Security standards](./docs/security-standards.md)
- [Codex skill routing](./docs/codex-skill-routing.md)
- [Hook context policy](./docs/hook-context-policy.md)
- [Living docs policy](./docs/living-docs-policy.md)
- [Localization standards](./docs/localization-standards.md)

## Codex Skills

Project skill sources are committed in [.codex/project-skills.json](./.codex/project-skills.json). Skills install from upstream sources; third-party skill folders are not vendored in this repo.

Restore or verify shared skills from the repo root:

```console
npm run skills:dry-run
npm run skills:install
npm run skills:verify
```

Restart Codex after installing skills.

Read the relevant guardrails and checklist before adding backend or frontend features.
