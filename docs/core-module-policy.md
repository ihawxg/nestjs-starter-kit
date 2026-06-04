# Core Module Policy

## Purpose

Do not create `CoreModule` yet. This policy defines when it becomes useful and how to keep it from becoming a dumping ground.

Current infrastructure modules stay separate:

- `db` owns database connection and migrations.
- `app-cache` owns cache setup.
- `logger` owns logging and logging interceptors.
- `global` owns current app-wide providers such as async storage and mail.

## When To Create CoreModule

Create `api/src/core/core.module.ts` only when there is a stable application-wide provider used by at least two real domain modules.

Good reasons:

- common guard used across admin domains
- common pipe/interceptor used across domains
- request context helper used by multiple modules
- shared decorator used across controllers
- storage/cache/mail abstraction interface used by multiple domains

Bad reasons:

- "we might need it later"
- a single domain wants a helper
- avoiding local domain folders
- moving business logic out of a domain
- creating a place for random utilities

## Allowed Shape

When needed:

```text
api/src/core/
  core.module.ts
  decorators/
  guards/
  interceptors/
  pipes/
  errors/
  types/
  utils/
```

Every file in `core` needs a clear app-wide purpose.

## Not Allowed

Do not put these in `core`:

- domain business logic
- domain DTOs
- domain entities
- domain repositories
- one-off helpers used by only one module
- direct TypeORM repositories for civic domains
- controllers for civic data

## Migration From Existing Modules

Do not merge `global`, `db`, `app-cache`, or `logger` into `core` casually.

If a later migration is needed:

- move one concern at a time
- keep public exports stable
- update imports deliberately
- run guardrails and tests
- document why the move improves structure

## Enforcement

Until `CoreModule` exists, shared code should stay inside the domain that owns it. Move code to `core` only after there are at least two real consumers and the abstraction is stable.
