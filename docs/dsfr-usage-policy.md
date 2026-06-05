# DSFR Usage Policy

## Status

DSFR is the preferred visual direction for the public municipality frontend only if written authorization covers production use outside French State websites.

Do not ship direct DSFR usage to production until authorization is confirmed and documented.

## Packages

Planned packages:

- `@gouvfr/dsfr`
- `@codegouvfr/react-dsfr`

These packages are advisory implementation choices until the frontend is scaffolded. The project guardrails already assume DSFR imports must be wrapped locally.

## Import Boundary

Direct imports from DSFR packages are allowed only in:

- `frontend/src/components/dsfr`
- `frontend/src/components/ui`
- `frontend/src/lib/dsfr`
- frontend app provider/layout files

Feature components and route files must use local project components instead of importing DSFR directly.

## Why Wrap DSFR

Local wrappers keep:

- authorization-sensitive usage easy to replace
- accessibility behavior consistent
- Bulgarian/English labels centralized
- municipality styling controlled by project code
- future migration to a custom DSFR-inspired theme realistic

## Production Fallback

If DSFR authorization is not available before production:

- remove direct DSFR package usage
- keep the same local component API where practical
- replace internals with project-owned HTML/CSS
- preserve accessibility and government-site interaction patterns

## Content Rule

DSFR components provide structure, not municipality content. Do not hardcode navigation items, pages, categories, departments, or public labels that should come from backend APIs.
