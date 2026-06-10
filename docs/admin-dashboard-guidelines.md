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
- Unknown protected admin page routes render the admin 404 inside admin chrome.
- Unknown `/admin/api/*` routes return JSON `404` responses, not HTML admin chrome. Do not add `/admin/api/auth/*` or `/admin/api/news/*` proxy routes.

## Auth Policy

- Admin auth uses backend-owned HttpOnly cookies plus a readable signed CSRF cookie.
- Admin session cookie path is `/` so `/en/admin` and `/bg/admin` can both validate the same session. Keep the session cookie HttpOnly and never browser-readable.
- Browser code never receives or stores the backend JWT.
- Do not use `localStorage`, `sessionStorage`, JS-readable cookies, or public env vars for admin tokens.
- Browser admin API wrappers call backend `/admin/...` APIs directly with `credentials: include`.
- Unsafe admin cookie requests must send `x-townhall-csrf` through the approved admin fetch wrapper.
- Protected admin layouts must validate the current session before rendering.
- Admin not-found pages are protected by the same layout. Anonymous users on unknown admin page routes must be redirected to login before seeing admin chrome.
- Backend JWT validation must resolve an active admin account, not blindly trust token role claims.

## UI Policy

- Mantine is allowed only for the admin dashboard foundation.
- Mantine imports may appear only in admin route/component files and approved admin feature folders such as `frontend/src/features/admin-news`.
- `@mantine/dropzone` is allowed for protected admin upload and attachment controls only.
- Tiptap imports may appear only in approved admin rich text editor feature files.
- Admin rich text editors should provide a practical CMS baseline: paragraph reset, H2/H3 headings, blockquote, horizontal rule, bold/italic/underline/strikethrough, clear formatting, bullet/ordered lists, link/unlink, and undo/redo. Avoid ad hoc color controls unless a public rendering policy is defined.
- Mantine components that pass `next/link` through `component={Link}` must live in client components so server routes do not pass function props across the Server/Client boundary.
- Public UI remains project-owned Tailwind/lucide components and must not import Mantine.
- Do not add MUI, Chakra, Ant, Bootstrap, DSFR, or another component library.
- Admin components live under `frontend/src/components/admin`.
- Admin UI copy lives in Paraglide message files and is consumed through `frontend/src/lib/i18n/messages.ts`; it must support `en` and `bg`.

## API Boundaries

- Generated OpenAPI code remains under `frontend/src/lib/api/generated`.
- Admin SDK calls must be wrapped under `frontend/src/lib/admin-api`.
- Browser-facing admin auth helpers live under `frontend/src/lib/admin-auth`.
- Browser-facing admin CRUD helpers call backend `/admin/...` routes only through `frontend/src/lib/admin-api/admin-fetch.ts`; do not call Nest admin URLs directly from client components.
- Interactive admin CRUD screens should use TanStack Query with centralized feature query keys and mutation invalidation.
- Admin create screens may stage files in browser memory when the backend upload route needs a persisted record id. The screen must create the record first, then upload staged files through credentialed backend admin routes and show a clear upload failure if the second step fails.
- Admin asset panels may render image, PDF, CSV, text, and JSON previews when the browser can safely display them. Unsaved staged previews use temporary object URLs or browser `File` APIs only; persisted previews use protected backend asset routes so draft and archived assets are available to admins without exposing storage keys, local paths, or bearer JWTs. Office and other binary files should show a safe fallback with open/download actions unless a dedicated parser feature is planned.
- News admin uses protected backend routes for asset view/download so draft and archived assets are available to admins without exposing storage keys or local paths.
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
