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
