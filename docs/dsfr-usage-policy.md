# Retired DSFR Usage Policy

DSFR was evaluated during the first public frontend shell pass, but the current project decision is to use a project-owned Tailwind/token design system instead of external UI/component libraries.

Do not add DSFR packages, DSFR CSS imports, `frontend/src/components/dsfr`, or handwritten `fr-*` classes. Tailwind utilities are allowed only when backed by the project `townhall-*` theme tokens.

Current frontend design guidance lives in `docs/frontend-design-system-policy.md`.
