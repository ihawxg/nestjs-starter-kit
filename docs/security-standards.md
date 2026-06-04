# Security Standards

## Goal

Keep admin/public separation obvious and testable.

Use security skills for threat modeling and security review when auth, uploads, downloads, roles, secrets, or public data exposure changes.

## Role Model

- Admin can create, update, delete, publish, unpublish, and manage backend data.
- Public can read published data and download public files.
- Anonymous users are public visitors.
- First admin must be seeded or scripted.
- Do not add public admin registration.

## Admin Routes

Admin write routes require:

- JWT authentication
- admin role guard
- tests for anonymous denial
- tests for public/non-admin denial
- tests for admin success path

## Public Routes

Public routes must:

- return only published public data
- avoid private/admin fields
- include pagination for list endpoints
- avoid accepting trusted fields from request bodies

## File And Download Safety

Downloads must check publication state before serving files.

Do not expose:

- storage keys
- local paths
- stack traces
- tokens
- password hashes

## Future Requirements

Before production, add explicit policy for:

- rate limiting
- audit logging for admin writes
- upload scanning/validation
- security headers review
- backup/restore procedure
