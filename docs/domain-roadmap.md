# Domain Roadmap

## V1 Scope

Townhall Manipulicity v1 backend should focus on core civic website data. Build public read paths and admin management paths for each domain.

## Pages

Purpose: managed website content pages.

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

Admin capabilities:

- Create announcements.
- Edit title, body, summary, publication date, and status.
- Publish or unpublish announcements.
- Delete or archive announcements.

Public capabilities:

- List published announcements.
- View published announcement details.

## Documents And Downloads

Purpose: public files such as forms, reports, meeting documents, notices, and downloadable resources.

Admin capabilities:

- Add document metadata.
- Attach or replace stored file.
- Categorize documents.
- Publish or unpublish documents.
- Delete or archive documents.

Public capabilities:

- List published documents.
- Filter or search published documents when supported.
- Download published files.

Implementation note: store metadata in PostgreSQL and file bytes through a storage layer.

## Events

Purpose: meetings, public hearings, office events, and civic deadlines.

Admin capabilities:

- Create events.
- Edit event title, description, location, start/end time, and status.
- Publish or unpublish events.
- Delete or archive events.

Public capabilities:

- List published upcoming events.
- View published event details.

## Contacts And Departments

Purpose: public contact information for townhall departments and offices.

Admin capabilities:

- Create departments and contacts.
- Edit phone, email, location, hours, and display order.
- Publish or hide contacts.
- Delete or archive contacts.

Public capabilities:

- List published departments and contacts.
- View department/contact details.

## Cross-Domain Requirements

All domains should support:

- Admin-only write operations.
- Public-only read/download operations.
- Published/unpublished state.
- Created and updated timestamps.
- DTO validation.
- Swagger documentation.
- TypeORM migrations for schema changes.
- Tests for admin access denial and public read behavior.

## Initial Build Order

1. Role model and admin guard.
2. Seeded or scripted first-admin creation.
3. Pages.
4. News and announcements.
5. Documents and downloads.
6. Events.
7. Contacts and departments.
