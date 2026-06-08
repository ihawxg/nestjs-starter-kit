# Frontend Architecture

## Purpose

The frontend contains two separate surfaces:

- Public municipality website for anonymous visitors.
- Protected admin dashboard foundation for trusted admin accounts.

Public routes consume published backend APIs only. Admin routes use protected backend admin APIs through server-owned wrappers.

## Current Decision

- App shape: one `frontend/` workspace beside `api/`.
- Framework: Next.js App Router with TypeScript.
- Source root: `frontend/src`.
- Public locale routes: `frontend/src/app/[locale]` with `en` and `bg`.
- Localized admin page routes: `frontend/src/app/[locale]/admin`.
- Internal admin API route handlers: `frontend/src/app/admin/api`.
- `/en/admin/login` and `/bg/admin/login` are public only for sign-in; `/en/admin`, `/bg/admin`, and future admin management screens are protected.
- Active admin sessions that visit a localized admin login page redirect to that locale dashboard.
- Root `/` redirects to `/en`.
- Backend API types and client code are generated from backend OpenAPI into `frontend/src/lib/api/generated`.
- The generated SDK may contain the full backend OpenAPI surface, including admin routes. Public application code must call only project wrappers under `frontend/src/lib/api`; do not import or call admin SDK functions from pages, components, or features.
- Frontend code must not handwrite backend DTO or response types.
- Public data fetching defaults to Server Components. Use client components only for interactive UI.
- TanStack Query is allowed only for interactive client fetching that benefits from client cache/refetch behavior.
- Frontend env access goes through the Zod-backed helper in `frontend/src/lib/config`.
- Rich CMS/news/page HTML must be sanitized server-side through the project helper before rendering.
- Locale-aware dates use the `date-fns` helper in `frontend/src/lib/format`.
- Conditional class composition uses the project `clsx` helper instead of ad hoc template sprawl.
- React Hook Form and Zod resolvers are available for future forms; do not wire them into read-only pages.
- Visual styling uses Tailwind v4 utilities backed by project-owned navy/gold civic tokens in `frontend/src/styles/townhall-theme.css`.
- `lucide-react` icons are allowed for controls and civic UI affordances.
- Public UI does not use external component libraries.
- Mantine is allowed only for protected admin route/component files.
- Admin auth uses internal Next route handlers and an HttpOnly cookie; browser code never receives or stores backend JWTs.

## Monorepo Shape

```text
api/
  openapi.json
frontend/
  messages/
  project.inlang/
  src/
    app/
      [locale]/
      [locale]/
        admin/
      admin/
    components/
      admin/
      ui/
    features/
    lib/
      api/
        generated/
      admin-api/
      admin-auth/
      config/
      content/
      format/
      i18n/
        paraglide/
      navigation/
      styles/
    server/
    styles/
      townhall-theme.css
  postcss.config.mjs
docs/
scripts/
  guardrails/
```

Root `package.json` owns workspace-level verification only. Framework commands stay inside the relevant workspace.

## Routing

- Public routes must be locale-prefixed: `/en/...` and `/bg/...`.
- Admin page routes are locale-prefixed: `/en/admin/...` and `/bg/admin/...`.
- Internal admin API routes are not locale-prefixed and remain under `/admin/api/*`.
- Unprefixed frontend routes should redirect to `/en` where practical.
- Locale validation must allow only `en` and `bg`.
- Frontend slugs are shared across languages because backend slugs are shared.
- Public frontend routes must not call `/admin/...`.
- The global header/footer route menu is frontend-owned in `frontend/src/lib/navigation/public-navigation.ts`.
- Backend navigation APIs may still exist for CMS-managed links, but the public shell must not depend on `/navigation/header` or `/navigation/footer` to show its primary menu.
- The public shell header/footer follows the reference structure from `tanstackstart/my-app/src/public`: utility strip, masthead, navy desktop nav, rich dropdown columns with callout, mobile accordion, footer action strip, contact block, columns, and legal links.
- The current `/en` and `/bg` root pages intentionally render only the global header, empty main landmark, and footer. Do not add homepage body sections until the homepage feature is explicitly planned.
- Empty public shell pages use a full-height flex column so the footer stays at the viewport bottom.
- Header selected-state styling uses the actual current pathname, not only the locale root path.
- The public header displays user-requested fallback chrome when backend site settings are empty: `Mon-Fri, 8:30 AM-4:30 PM`, `(555) 014-2800`, and `24 Main Street, Millbrook`. Published site settings may override these values.
- Header/footer chrome fallback settings are centralized in `frontend/src/lib/public-site/fallback-settings.ts` so home, not-found, and future public shell pages do not drift.
- Root `not-found.tsx` renders a locale-aware public 404 shell with the same header/footer chrome and no backend admin calls.
- `/admin` redirects to `/en/admin`; `/admin/login` redirects to `/en/admin/login`.
- `/en/admin/login` and `/bg/admin/login` render localized admin sign-in pages and post to internal Next auth route handlers.
- `/en/admin` and `/bg/admin` render the protected localized dashboard foundation after server-side session validation.
- Unknown protected admin page routes render a Mantine admin 404 inside the protected admin shell.
- Unknown `/admin/api/*` routes return JSON `404` responses so admin API callers never receive HTML 404 chrome.

## API Layer

- Generate `api/openapi.json` without starting a dev server by running `npm run api:generate -w frontend`.
- Generated API code lives only under `frontend/src/lib/api/generated` or another approved generated folder.
- Backend calls go through small public wrappers under `frontend/src/lib/api`.
- Public wrappers may import public SDK functions from generated code. Public routes, components, and features must not import generated SDK functions directly.
- Admin backend calls go through wrappers under `frontend/src/lib/admin-api`.
- Browser-facing admin auth helpers go through `frontend/src/lib/admin-auth` and call internal `/admin/api/auth/*` routes only.
- Frontend-owned UI strings live in `frontend/messages/en.json` and `frontend/messages/bg.json`, compile through Paraglide into `frontend/src/lib/i18n/paraglide`, and are consumed through project helpers under `frontend/src/lib/i18n/messages.ts`.
- Do not call `fetch()` directly from pages, components, or feature folders.
- Do not handwrite backend DTO, entity, response, or payload types outside generated code.
- Runtime config must centralize the backend base URL, currently `NEXT_PUBLIC_API_BASE_URL` for public calls.
- Server-side admin calls may use `BACKEND_API_BASE_URL`, falling back to the public API base URL for local development.
- Validate frontend environment values with `@t3-oss/env-nextjs` and Zod before using them.

## Foundation Tooling

- Paraglide JS: frontend-owned UI strings for public/admin chrome. Backend civic content remains localized by backend APIs.
- `@tanstack/react-query`: interactive client fetching only, such as future filters or forms that need refetching without navigation.
- `react-hook-form` with `@hookform/resolvers`: non-trivial future forms.
- `zod` and `@t3-oss/env-nextjs`: runtime env validation and future form/query validation.
- `sanitize-html`: server-side rich text sanitization before rendering backend CMS content.
- `date-fns`: English/Bulgarian date formatting.
- `clsx`: local class composition helper for UI primitives.
- `tailwindcss` with `@tailwindcss/postcss`: utility styling compiled from project-owned theme tokens.
- `lucide-react`: icon primitives for buttons, navigation, search, contact rows, and status affordances.
- `@mantine/*`: protected admin dashboard shell, login form, and future admin CRUD UI only.
- `sharp`: Next image optimization dependency.

Adding these packages does not change the default architecture: public read pages should remain Server Components unless interactivity requires client state.

## Design Artifacts

- Static public-page mockups live under `docs/frontend-design/pages`.
- Regenerate mockups with `npm run design:mockups` from the repo root.
- Mockups are design artifacts, not screenshots of implemented routes.
- Mockup generation must not start Next.js, run builds, call the backend, start Docker, or run browser tests.

## Component Boundaries

- `src/app` owns routes, layouts, and route-level composition.
- `src/features/<feature>` owns domain UI for one public area such as news, documents, events, departments, pages, alerts, or search.
- `src/components/ui` owns local reusable presentational primitives.
- `src/lib` owns stable app utilities, API wrappers, config, localization helpers, and formatting.
- Do not create a generic dumping ground for unrelated components or helpers.
- `src/styles/townhall-theme.css` owns project colors, Tailwind `@theme` tokens, and shared base focus/body styles.
- Components may use Tailwind utilities, but colors must come from `townhall-*` theme tokens rather than arbitrary hex values.
- Do not create `src/components/dsfr` or import DSFR, Bootstrap, MUI, Chakra, or Ant.
- Do not import Mantine outside `src/app/admin`, `src/app/[locale]/admin`, or `src/components/admin`.

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

Developer lifecycle scripts exist in `frontend/package.json` for humans:

```console
npm run dev
npm run build
npm run start
```

Agents must not run those as routine verification, and root package scripts must not alias them.

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
