# Townhall Manipulicity Backend

Backend API for the Townhall Manipulicity website. The service exposes public civic data for anonymous visitors and protected management flows for administrators.

Current stack:

- NestJS REST API
- TypeORM
- PostgreSQL
- Redis cache
- JWT authentication
- Swagger API docs
- Pino request logging with trace IDs

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

## Core Commands

Run from `api/`.

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

Do not run dev servers, Docker startup, production start, or build commands as routine completion checks. Run `npm run build`, `npm run start:dev`, `npm start`, or `docker-compose up` only when explicitly requested.

Create or promote the first admin account:

```console
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='strong-password' npm run admin:create
```

## Documentation

- [Agent instructions](./AGENTS.md)
- [Backend guidelines](./docs/backend-guidelines.md)
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

Read the guardrails and checklist before adding new backend features.
