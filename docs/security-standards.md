# Security Standards

## Goal

Keep admin/public separation obvious and testable.

Use security skills for threat modeling and security review when auth, uploads, downloads, roles, secrets, or public data exposure changes.

## Role Model

- Admin can create, update, delete, publish, unpublish, and manage backend data.
- Anonymous public visitors can read published data, search public data, and download public files.
- Anonymous users are public visitors.
- First admin must be seeded or scripted.
- Do not add public admin registration or public account registration.

Current implementation:

- User JWT payload includes `role`.
- Admin routes use `JwtAuthGuard`, `RolesGuard`, and `@Roles(UserRole.ADMIN)`.
- First admin is created or promoted with `npm run admin:create`.
- Public `/user/register` is disabled.
- Login is admin-only; disabled accounts and legacy non-admin rows are rejected.
- Admin account lifecycle uses `/admin/accounts` while the physical persistence table remains `users`.
- Protected JWT validation resolves an active admin account before routes run.
- `GET /admin/auth/session` is the backend session check used by the protected frontend admin dashboard.
- The frontend admin dashboard stores the backend JWT only in an HttpOnly cookie with path `/` so localized `/en/admin` and `/bg/admin` routes can validate it; browser JavaScript must never receive or persist it.
- Frontend admin browser code calls internal Next admin routes for CRUD and protected downloads. Direct browser-to-Nest admin calls require a deliberate cookie/CSRF auth redesign.

## Admin Routes

Admin write routes require:

- JWT authentication
- admin role guard
- tests for anonymous denial
- tests for legacy public/non-admin denial
- tests for admin success path
- audit metadata for create/update/archive/upload/category/contact/account actions
- admin write rate limits

## Public Routes

Public routes must:

- return only published public data
- avoid private/admin fields
- include pagination for list endpoints
- avoid accepting trusted fields from request bodies
- use public rate limits for reads, downloads, and search

## File And Download Safety

Downloads must check publication state before serving files.

Admin preview/download routes may serve draft or archived assets only after JWT and admin role validation. Frontend previews for persisted admin assets must use these protected routes, and unsaved staged file previews may use temporary browser object URLs or browser `File` APIs only. Preview UI may render image, PDF, CSV, text, and JSON content when browser-safe, but Office/binary files should fall back to safe metadata plus protected open/download actions unless a parser feature is explicitly designed.

Uploads must validate MIME type and size before persisting local files.

Do not expose:

- storage keys
- local paths
- stack traces
- tokens
- password hashes

Do not store these in audit metadata either.

## Audit Logs

Audit logs should capture admin write accountability:

- actor account id/email
- action
- target type/id
- request id
- timestamp
- safe route-level metadata

Audit logs are append-only operational records. Do not use them as public civic data, and do not add update/delete flows unless a retention policy is explicitly designed.

## Rate Limiting

Rate limits are configured through environment variables and route metadata:

- `POST /user/login` uses stricter login limits.
- Public reads/downloads/search use public limits.
- Admin writes use admin write limits.

Keep rate limit defaults conservative and documented in `.env.example`.

## Future Requirements

Before production, add explicit policy for:

- upload scanning/validation
- security headers review
- backup/restore procedure
