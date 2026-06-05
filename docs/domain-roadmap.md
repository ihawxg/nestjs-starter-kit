# Domain Roadmap

## V1 Scope

Townhall Manipulicity v1 backend should focus on core civic website data. Build public read paths and admin management paths for each domain.

## Pages

Purpose: managed website content pages.

Status: CMS foundation backend logic.

Admin capabilities:

- Create pages.
- Edit title, slug, body, and status.
- Publish or unpublish pages.
- Delete or archive pages.
- Manage SEO title and description.

Public capabilities:

- List published pages.
- View published page by slug.

## Site Settings

Purpose: global website identity, contact details, social links, logo metadata, and SEO defaults.

Status: CMS foundation backend logic.

Admin capabilities:

- View current site settings.
- Create or update singleton settings through `PATCH /admin/site-settings`.
- Activate or deactivate public settings.

Public capabilities:

- View active site settings.

Implementation note: no settings are seeded. Public response may be `null` until an admin creates settings.

## Navigation

Purpose: editable public menu structure for header, footer, sidebar, or other frontend locations.

Status: CMS foundation backend logic.

Admin capabilities:

- Create, update, list, inspect, and deactivate navigation items.
- Link items to either a URL or a CMS page.
- Nest items with `parentId`.

Public capabilities:

- View active navigation by location.

## Alerts

Purpose: public website banners for emergency or important notices.

Status: CMS foundation backend logic.

Admin capabilities:

- Create, update, list, inspect, and archive alerts.
- Set severity, status, start time, and end time.

Public capabilities:

- View currently active published alerts.

## Media Library

Purpose: reusable uploaded files for CMS pages, site logos, staff photos, officials photos, service files, and future location media.

Status: media and people/governance foundation.

Admin capabilities:

- Upload a single reusable media file.
- List media files with pagination and optional type filter.
- Delete media only when it is not referenced by another domain.

Public capabilities:

- View safe media metadata by id when the file is referenced by published/active public content.

Implementation notes:

- The media library reuses `stored_files`.
- Public and admin responses never expose storage keys or local filesystem paths.
- Public metadata routes hide unreferenced or draft-only uploads.
- Existing documents remain the public downloadable document domain; media is the reusable file library.

## Staff

Purpose: public staff directory for townhall workers and office contacts beyond department-level generic contacts.

Status: people/governance foundation.

Admin capabilities:

- Create, update, list, inspect, and archive staff records.
- Assign optional department and photo file references.
- Manage publication status and display order.

Public capabilities:

- List published staff.
- View published staff detail by slug.

## Officials

Purpose: mayor, council members, board members, and other elected or appointed public officials.

Status: people/governance foundation.

Admin capabilities:

- Create, update, list, inspect, and archive official records.
- Assign optional photo file references.
- Manage role, term fields, publication status, and display order.

Public capabilities:

- List published officials.
- View published official detail by slug.

## Committees

Purpose: public committee and board listings.

Status: people/governance foundation.

Admin capabilities:

- Create, update, list, inspect, and archive committee records.
- Manage publication status and display order.

Public capabilities:

- List published committees.
- View published committee detail by slug.

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
5. Pages. Implemented as part of CMS foundation in batch 6.
6. Events. Batch 3.
7. Contacts and departments. Batch 4.
8. Platform hardening: audit logs, rate limiting, admin account lifecycle, and search. Batch 5.
9. CMS foundation: pages, site settings, navigation, and alerts. Batch 6.
10. Media library, staff, officials, and committees. Batch 7.

## Platform Hardening

Purpose: keep the growing backend accountable, harder to abuse, and easier to operate.

Status: batch 5 foundation.

Admin capabilities:

- List audit logs by actor, target type, and action.
- Create and update admin accounts through `/admin/accounts`.
- Disable admin accounts with `isActive` instead of deleting history.

Public capabilities:

- Search published news, documents, events, and departments through `/search`.

Implementation notes:

- Authenticated accounts are admin-only. Public visitors remain anonymous.
- Keep the existing physical `users` table until a deliberate rename migration is planned.
- Rate limits are configured for login, public reads/downloads/search, and admin writes.
- Audit logs must never store passwords, tokens, storage keys, local paths, or raw uploaded file paths.
