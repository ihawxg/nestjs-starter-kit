# Admin Dashboard Guidelines

## Purpose

The admin dashboard is the protected content-management surface for Townhall Manipulicity. It lives in the existing `frontend/` Next.js app, but it is separate from the anonymous public website.

## Route Shape

- Public website routes stay under `frontend/src/app/[locale]`.
- Localized admin page routes live under `frontend/src/app/[locale]/admin`.
- `/en/admin/login` and `/bg/admin/login` are the only unprotected admin pages.
- Active admin sessions visiting a localized admin login page redirect to that locale dashboard.
- `/en/admin`, `/bg/admin`, and future management screens live under the protected localized admin route group.
- Legacy `/admin` redirects to `/en/admin`; legacy `/admin/login` redirects to `/en/admin/login`.
- Internal admin auth route handlers live under `/admin/api/auth/*`.
- Unknown protected admin page routes render the admin 404 inside admin chrome.
- Unknown `/admin/api/*` routes return JSON `404` responses, not HTML admin chrome.

## Auth Policy

- Admin auth uses an HttpOnly cookie owned by the Next admin layer.
- Admin session cookie path is `/` so `/en/admin` and `/bg/admin` can both validate the same session. Keep it HttpOnly and never browser-readable.
- Browser code never receives or stores the backend JWT.
- Do not use `localStorage`, `sessionStorage`, JS-readable cookies, or public env vars for admin tokens.
- Internal route handlers may call the backend login/session APIs server-side.
- Protected admin layouts must validate the current session before rendering.
- Admin not-found pages are protected by the same layout. Anonymous users on unknown admin page routes must be redirected to login before seeing admin chrome.
- Backend JWT validation must resolve an active admin account, not blindly trust token role claims.

## UI Policy

- Mantine is allowed only for the admin dashboard foundation.
- Mantine imports may appear only in `frontend/src/app/admin`, `frontend/src/app/[locale]/admin`, and `frontend/src/components/admin`.
- Mantine components that pass `next/link` through `component={Link}` must live in client components so server routes do not pass function props across the Server/Client boundary.
- Public UI remains project-owned Tailwind/lucide components and must not import Mantine.
- Do not add MUI, Chakra, Ant, Bootstrap, DSFR, or another component library.
- Admin components live under `frontend/src/components/admin`.
- Admin UI copy lives in Paraglide message files and is consumed through `frontend/src/lib/i18n/messages.ts`; it must support `en` and `bg`.

## API Boundaries

- Generated OpenAPI code remains under `frontend/src/lib/api/generated`.
- Admin SDK calls must be wrapped under `frontend/src/lib/admin-api`.
- Browser-facing admin auth helpers live under `frontend/src/lib/admin-auth`.
- Public code must not import admin helpers or call `/admin/...`.

## Testing And Verification

- Admin components, route handlers, auth helpers, and admin route files need colocated specs.
- Tests must cover localized login redirect behavior, admin language switching, admin 404 route boundaries, and legacy `/admin` redirects.
- Routine verification must not run dev/build/start/Docker/browser checks.
- Use:

```console
npm run guardrails -w frontend
npm run lint-ci -w frontend
npm test -w frontend
npm run verify -w frontend
```
