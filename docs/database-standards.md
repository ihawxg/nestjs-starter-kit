# Database Standards

## Goal

Keep PostgreSQL schema, indexes, migrations, and query behavior safe as the backend grows.

Use the installed `postgres` skill for schema, indexing, query, migration, and `EXPLAIN` review. Repo guardrails and docs remain the source of truth.

## Migrations

- Every entity/schema change requires a TypeORM migration.
- Keep `up` and `down` reversible where practical.
- Do not edit old migrations after they are shared.
- Do not rely on TypeORM `synchronize`.
- Keep entity fields aligned with migration columns.

## Entity Policy

Public civic-domain entities should include:

- `createdAt`
- `updatedAt`
- publish/visibility state such as `status`, `published`, `isPublished`, or `visibility`

Use explicit uniqueness for natural identifiers such as slugs and emails.

Audit log entities are the narrow exception: they are immutable operational records with `createdAt` only and no publish status. Do not apply public civic visibility rules to audit logs.

## Index Policy

Add indexes when fields support:

- public lookup by slug/id
- public filtering by status/date/category
- admin listing/filtering
- document download lookup
- foreign-key joins
- category scope and slug lookup
- file asset ownership lookup
- event status/date filtering and upcoming event lists
- department status/display-order filtering
- department contact ownership/display-order filtering
- admin account role/active-state filtering
- audit log actor/action/target/timestamp filtering
- CMS page slug/status filtering
- navigation location/active filtering
- alert status/date-window filtering

Indexes speed reads but add write/storage overhead, so use them intentionally.

## Query Review

Require `EXPLAIN` or `EXPLAIN ANALYZE` evidence before approving complex or high-volume query work.

Review:

- sequential scans on growing tables
- missing indexes for filters/order
- offset pagination on large tables
- N+1 query patterns
- wide selects returning unused columns

## Pagination

Public list endpoints must define pagination. Default to explicit `page`/`limit` or cursor policy before exposing large collections.

## Categories And Assets

- Category slugs are unique per scope, not globally.
- News/document category assignment uses join tables.
- Stored file rows keep metadata only; file bytes stay outside PostgreSQL.
- Asset tables link civic records to stored file metadata and should be indexed by owner id.

## Events

- Event slugs are unique.
- Public upcoming event lists should have an index on start time and status/date fields.
- Keep `starts_at` and `ends_at` as timestamps and validate the time window in service logic.

## Departments And Contacts

- Department slugs are unique.
- Department public/admin lists should index status and display order.
- Department contacts should index department ownership and display order.
- Contacts use `is_active` for visibility instead of a full status enum.

## Admin Accounts And Audit Logs

- Keep the existing `users` table name until a deliberate account-table rename is planned.
- Admin account disabling uses `is_active` so historical audit rows remain meaningful.
- Audit logs should index actor/action, target type/id, and creation time.
- Audit log metadata uses `jsonb` for safe structured context only; never store secrets, tokens, storage keys, or local file paths.

## CMS Foundation

- Pages use unique slugs and indexed status/published date fields.
- Site settings are a singleton-style table, but no row is seeded by default.
- Navigation items index location/isActive and parent/display order.
- Alerts index status, startsAt, and endsAt for active banner lookup.

## Localization

- Translation tables use parent id, `locale`, localized text fields, and timestamps.
- Translation tables must have a unique `(parent_id, locale)` index and a `locale` index.
- Parent foreign keys should cascade delete translation rows.
- Existing public text is backfilled into English translation rows when localization is introduced.
