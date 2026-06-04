# Architecture Standards

## Goal

Keep Townhall Manipulicity backend consistent as it grows. The default shape is domain-first NestJS modules under `api/src/<domain>`.

## Module Boundaries

Use one module per civic domain. Domain modules own their controller, service, DTOs, entities, tests, and local helpers.

Infrastructure modules are exceptions:

- `app-cache`
- `core`
- `db`
- `global`
- `health`
- `logger`
- `services`
- `user`

New non-infrastructure folders with TypeScript code must follow the domain module shape.

`core` is reserved for a future `CoreModule`. Do not create it until there is stable application-wide code used by at least two real domain modules. See `docs/core-module-policy.md`.

## Layer Responsibilities

Controllers:

- Define HTTP routes.
- Attach guards, interceptors, and Swagger metadata.
- Accept DTOs and query parameters.
- Return safe response shapes.

Services:

- Own business rules.
- Call repositories, cache, storage, mail, or other providers.
- Enforce public visibility filters.
- Avoid HTTP-only concerns.

Entities:

- Model persisted database state.
- Stay aligned with migrations.
- Include timestamp and publish/visibility policy for public domains.

DTOs:

- Validate request bodies and meaningful query parameters.
- Never replace entities.
- Never accept trusted fields such as role, ownership, or publication state from public requests.

## Drift Rules

Do not add:

- shared catch-all services
- giant controllers
- cross-domain deep imports
- entity classes as request DTOs
- public list endpoints without pagination/query policy
- schema changes without migrations

Future enforcement phase:

- Add `dependency-cruiser` for circular import and module-boundary checks.
- Add `knip` for unused files, exports, and dependency cleanup.

Add these after 2-3 real domain modules exist, not before.
