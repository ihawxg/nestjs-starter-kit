# Frontend Design System Policy

## Status

The public frontend uses a project-owned navy/gold civic design system implemented with Tailwind v4 utilities and project tokens. External UI/component libraries are not part of the public frontend architecture.

Do not add DSFR, Bootstrap, MUI, Chakra, Ant, or similar component libraries unless the product direction changes and this policy, guardrails, and tests are updated in the same change.

Mantine is the only current component-library exception, and it is scoped to the protected admin dashboard under `frontend/src/app/[locale]/admin`, legacy/admin API route files under `frontend/src/app/admin`, and `frontend/src/components/admin`. Public routes, public shell components, and public features must not import Mantine.

`lucide-react` icons are allowed for public shell controls and common civic UI affordances. Icons do not replace semantic text labels, headings, form labels, or accessible names.

## Ownership

- UI primitives live under `frontend/src/components/ui`.
- Admin dashboard components live under `frontend/src/components/admin`.
- Domain-specific UI lives under the owning feature folder once feature pages are added.
- Stable tokens live in `frontend/src/styles/townhall-theme.css`.
- Components use project-owned components and Tailwind utilities backed by `townhall-*` theme tokens rather than library-owned classes.

## Visual Direction

- Dark navy header/footer shell.
- Gold accent lines, active states, and official emphasis.
- Cream information bands for notices and civic service rails.
- White content surfaces with restrained borders and shadows.
- Dense but readable public-service layouts.

## Component Rules

- Prefer semantic HTML landmarks, headings, lists, links, buttons, and forms.
- Keep accessibility in component tests where practical.
- Keep shared UI small and purposeful; a reusable primitive should have at least two real consumers or be part of the public shell foundation.
- Do not hardcode municipality content in design-system components.
- Do not render storage keys, local paths, tokens, draft data, or admin metadata.
- Do not use arbitrary Tailwind hex utilities such as `bg-[#...]`; add or reuse a token in `townhall-theme.css`.

## Design Mockups

Static public-page mockups live under `docs/frontend-design/pages`.

Regenerate them from the repo root:

```console
npm run design:mockups
```

The mockup generator must stay static. It must not start Next.js, run a build, call the backend, start Docker, or launch browser tests.
