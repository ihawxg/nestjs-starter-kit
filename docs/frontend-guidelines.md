# Frontend Guidelines

## Non-Negotiable Rules

- Use Next.js App Router only. Do not add the Pages Router.
- Keep frontend source under `frontend/src`.
- Keep locale routes under `frontend/src/app/[locale]`.
- Support only `en` and `bg` until product scope changes.
- Do not hardcode municipality pages, navigation, categories, departments, staff, officials, or content.
- Do not call admin APIs from the public frontend.
- Do not store JWTs or auth state in `localStorage` or `sessionStorage`.
- Future admin auth must use HttpOnly cookies.
- Do not expose storage keys, local paths, password hashes, tokens, draft data, or admin metadata.
- Do not run dev/build/start/Docker/browser-test commands as routine completion checks.

## API And Types

- Generate frontend API types from backend OpenAPI.
- Keep generated code in the approved generated API folder.
- Use the generated SDK or `src/lib/api` wrappers for all backend calls.
- Do not handwrite backend response or DTO types in frontend code.
- Keep frontend-specific view models small and derived from generated types at the API boundary.
- Public pages must handle empty results and backend English fallback metadata without crashing.

## Rendering Defaults

- Prefer Server Components for public read pages.
- Use Client Components only for interaction, form state, dynamic controls, or browser-only behavior.
- Do not move whole pages to client components to solve a small interactive problem.
- Keep route-level data requirements explicit in the route or feature API wrapper.
- Avoid global mutable client state for public content.

## Design System

- DSFR package imports must go through local wrapper/provider files.
- Build project-owned components around DSFR patterns instead of scattering raw DSFR imports.
- Keep DSFR production use blocked until authorization is confirmed and documented.
- If authorization is unavailable before production, replace direct DSFR usage with a custom DSFR-inspired theme.
- Accessibility is part of the component contract, not a final polish pass.

## Localization

- All public routes use `en` or `bg`.
- Missing Bulgarian backend translations may fall back to English. The UI must remain stable.
- Locale switchers should preserve the current route where possible.
- Do not auto-translate in the frontend. Translation happens through backend admin APIs.

## Security

- The public frontend is anonymous.
- Never embed admin tokens in public code.
- Never expose backend secrets through `NEXT_PUBLIC_*`.
- Do not trust URL params or search params. Validate and normalize locale, page, limit, type, and slug inputs.
- Use backend public download routes rather than constructing local storage paths.

## Performance

- Keep large lists paginated.
- Avoid client waterfalls by fetching route data on the server where possible.
- Keep images/media served through safe backend media routes.
- Use React performance skills for complex component trees, expensive lists, or repeated rerender issues.

## Testing

- Use Vitest and React Testing Library.
- Keep specs colocated with source files as `*.spec.ts` or `*.spec.tsx`.
- Unit-test API wrappers, locale helpers, and feature formatting.
- Component-test DSFR wrappers, public feature components, search/forms, and safety rendering rules.
- Use MSW for frontend API wrapper tests.
- Do not test generated API code directly; test the project wrapper around it.
- Avoid snapshot tests as the main proof of behavior.
- Browser tests are opt-in and must not start a dev server.
- Frontend feature work should run `npm run guardrails`, `npm run lint-ci`, `npm run type-check`, and `npm test` from `frontend/` once the app exists.
