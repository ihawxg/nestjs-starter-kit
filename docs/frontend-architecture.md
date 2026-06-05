# Frontend Architecture

## Purpose

The frontend will be a public municipality website for anonymous visitors. It consumes published backend APIs only. Admin CMS screens are out of scope until explicitly planned.

## Current Decision

- App shape: one `frontend/` workspace beside `api/`.
- Framework: Next.js App Router with TypeScript.
- Source root: `frontend/src`.
- Public locale routes: `frontend/src/app/[locale]` with `en` and `bg`.
- Root `/` redirects to `/en`.
- Backend API types and client code are generated from backend OpenAPI. Frontend code must not handwrite backend DTO or response types.
- Public data fetching defaults to Server Components. Use client components only for interactive UI.
- TanStack Query is allowed only for interactive client fetching that benefits from client cache/refetch behavior.

## Monorepo Shape

```text
api/
frontend/
  src/
    app/
      [locale]/
    components/
      dsfr/
      ui/
    features/
    lib/
      api/
        generated/
      config/
      i18n/
    server/
    styles/
docs/
scripts/
  guardrails/
```

Root `package.json` owns workspace-level verification only. Framework commands stay inside the relevant workspace.

## Routing

- Public routes must be locale-prefixed: `/en/...` and `/bg/...`.
- Unprefixed frontend routes should redirect to `/en` where practical.
- Locale validation must allow only `en` and `bg`.
- Frontend slugs are shared across languages because backend slugs are shared.
- Public frontend routes must not call `/admin/...`.

## API Layer

- Generated API code lives only under `frontend/src/lib/api/generated` or another approved generated folder.
- Backend calls go through the generated API SDK or a small wrapper under `frontend/src/lib/api`.
- Do not call `fetch()` directly from pages, components, or feature folders.
- Do not handwrite backend DTO, entity, response, or payload types outside generated code.
- Runtime config must centralize the backend base URL, currently `NEXT_PUBLIC_API_BASE_URL` for public calls.

## Component Boundaries

- `src/app` owns routes, layouts, and route-level composition.
- `src/features/<feature>` owns domain UI for one public area such as news, documents, events, departments, pages, alerts, or search.
- `src/components/dsfr` owns DSFR wrappers.
- `src/components/ui` owns local reusable presentational primitives.
- `src/lib` owns stable app utilities, API wrappers, config, localization helpers, and formatting.
- Do not create a generic dumping ground for unrelated components or helpers.

Shared frontend code needs at least two real consumers before moving into `components/ui` or `lib`.

## Data Safety

The public frontend must never render or depend on:

- storage keys
- local paths
- tokens
- password hashes
- stack traces
- draft status or admin metadata
- unpublished records

If a backend response includes unexpected sensitive fields, fix the backend response shape before rendering them.

## Verification

Routine frontend verification must not start servers, run builds, or run browser tests.

Allowed routine checks:

```console
npm run guardrails
npm run lint-ci
npm run type-check
npm test
npm run verify
```

Browser checks are opt-in only through `verify:browser`, require `FRONTEND_TEST_BASE_URL`, and must target an already running app.

## Testing Architecture

- Test runner: Vitest.
- Component testing: React Testing Library.
- DOM environment: jsdom.
- API mocking: MSW for frontend wrapper tests.
- Coverage provider: V8.
- Test files are colocated beside source files:
  - `*.spec.ts` for helpers and API wrappers
  - `*.spec.tsx` for components, features, and routes
- Generated API code is not tested directly; project wrappers around generated code are tested.
- Snapshot tests are not the primary proof of behavior.
