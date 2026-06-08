# Frontend Design Mockups

This folder stores static design artifacts for the public municipality frontend. These PNGs are generated mockups, not screenshots of implemented Next.js routes.

## Regeneration

Run from the repo root:

```console
npm run design:mockups
```

The generator uses SVG templates rendered through `sharp`. It does not start Next.js, run a build, call the backend, start Docker, or launch browser tests.

## Viewports

- `desktop.png`: 1440 px wide desktop mockup.
- `mobile.png`: 390 px wide mobile mockup.

Image height is content-driven so each page can fit its layout without clipping or unnecessary blank space.

## Page Inventory

Each public page lives under `docs/frontend-design/pages/<page-id>/` and must include both `desktop.png` and `mobile.png`.

- `home`
- `search`
- `pages-list`
- `page-detail`
- `news-list`
- `news-detail`
- `documents-list`
- `documents-detail`
- `events-list`
- `events-detail`
- `departments-list`
- `department-detail`
- `staff-list`
- `staff-detail`
- `officials-list`
- `official-detail`
- `committees-list`
- `committee-detail`

Supporting backend data such as site settings, alerts, categories, and media are represented inside the relevant page mockups instead of standalone pages.

## Content Policy

- Use generic English placeholder content only.
- Do not seed real municipality content here.
- Keep the visual direction aligned with the project reference-style civic shell: utility strip, masthead, navy menu, rich dropdown, footer action strip, contact block, columns, and legal links.
- Use these artifacts to guide future route implementation, but keep backend APIs as the source of truth for live content.
