# Domain Roadmap

## V1 Scope

Townhall Manipulicity v1 backend should focus on core civic website data. Build public read paths and admin management paths for each domain.

## Pages

Purpose: managed website content pages.

Status: deferred until static CMS-style website content is needed.

Admin capabilities:

- Create pages.
- Edit title, slug, body, and status.
- Publish or unpublish pages.
- Delete or archive pages.

Public capabilities:

- List published pages.
- View published page by slug.

## News And Announcements

Purpose: official townhall updates for residents.

Status: batch 2 foundation.

Admin capabilities:

- Create announcements.
- Edit title, body, summary, publication date, and status.
- Upload and remove related images or files.
- Assign scoped news categories.
- Publish or unpublish announcements.
- Delete or archive announcements.

Public capabilities:

- List published announcements.
- Filter published announcements by category.
- View published announcement details.
- Download public assets attached to published announcements.

## Documents And Downloads

Purpose: public files such as forms, reports, meeting documents, notices, and downloadable resources.

Status: batch 2 foundation.

Admin capabilities:

- Add document metadata.
- Attach or replace stored file.
- Categorize documents.
- Upload and remove multiple related files or images.
- Assign scoped document categories.
- Publish or unpublish documents.
- Delete or archive documents.

Public capabilities:

- List published documents.
- Filter published documents by category.
- Download published files.

Implementation note: store metadata in PostgreSQL and file bytes through a storage layer.

## Categories

Purpose: managed taxonomy for public filtering and admin organization.

Admin capabilities:

- Create categories scoped to news or documents.
- Edit category name, slug, description, display order, and scope.
- Deactivate categories instead of hard deleting by default.
- Assign active scoped categories to news and documents.

Public capabilities:

- List active categories.
- Filter categories by scope.

Implementation note: category slugs are unique per scope.

## Events

Purpose: meetings, public hearings, office events, and civic deadlines.

Status: batch 3 foundation.

Admin capabilities:

- Create events.
- Edit event title, description, location, start/end time, and status.
- Publish or unpublish events.
- Delete or archive events.
- List and inspect draft, published, and archived events.

Public capabilities:

- List published upcoming events.
- View published event details.

## Contacts And Departments

Purpose: public contact information for townhall departments and offices.

Status: batch 4 foundation.

Admin capabilities:

- Create departments and contacts.
- Edit phone, email, location, hours, and display order.
- Publish or hide contacts.
- Delete or archive contacts.
- List and inspect draft, published, and archived departments.
- Deactivate contacts instead of hard deleting them.

Public capabilities:

- List published departments and contacts.
- View department/contact details.
- Public reads include active contacts only.

## Cross-Domain Requirements

All domains should support:

- Admin-only write operations.
- Admin management read operations for unpublished and archived records.
- Public-only read/download operations.
- Published/unpublished state.
- Created and updated timestamps.
- DTO validation.
- Swagger documentation.
- TypeORM migrations for schema changes.
- Tests for admin access denial and public read behavior.

## Initial Build Order

1. Role model and admin guard. Implemented in batch 1.
2. Seeded or scripted first-admin creation. Implemented in batch 1 with `npm run admin:create`.
3. News and announcements with categories and local assets. Batch 2.
4. Documents and downloads with categories and local assets. Batch 2.
5. Pages. Deferred.
6. Events. Batch 3.
7. Contacts and departments. Batch 4.
8. Platform hardening: audit logs, rate limiting, admin user management, and search.
