# Frontend Guidelines

## Non-Negotiable Rules

- Use Next.js App Router only. Do not add the Pages Router.
- Keep frontend source under `frontend/src`.
- Keep locale routes under `frontend/src/app/[locale]`.
- Support only `en` and `bg` until product scope changes.
- Do not hardcode municipality pages, categories, departments, staff, officials, or content.
- Keep the global header/footer route menu in `frontend/src/lib/navigation/public-navigation.ts`. Do not scatter menu links through shell components or depend on backend navigation data for the primary menu.
- Preserve the current reference-style shell shape: utility strip, masthead, navy menu with white inactive links, rich dropdown, mobile accordion, and footer action/column/legal sections.
- Keep the current locale root route as header, empty main landmark, and footer only. Do not add homepage hero, cards, service rails, or alert/content sections without an explicit homepage implementation plan.
- Keep desktop main navigation labels white on the dark navy menu. Only the selected/current/open item uses the gold background with dark text.
- Desktop main navigation color states are enforced by `townhall-desktop-nav-item` theme classes in `townhall-theme.css`, not by scattered text color utilities.
- Derive selected/current header navigation from the actual current pathname.
- Keep the user-requested fallback header contact details visible unless backend site settings provide replacements: `Mon-Fri, 8:30 AM-4:30 PM`, `(555) 014-2800`, and `24 Main Street, Millbrook`.
- Use the shared fallback settings helper for public shell header/footer chrome; do not duplicate fallback contact values per route.
- Public 404/not-found UI should reuse the public shell chrome and must not call admin APIs.
- Admin 404/not-found UI must stay under the protected admin route group and use admin chrome only for authenticated admins.
- Do not call admin APIs from the public frontend.
- Do not store JWTs or auth state in `localStorage` or `sessionStorage`.
- Admin frontend auth must use HttpOnly cookies through internal Next route handlers.
- `/en/admin/login` and `/bg/admin/login` are the only unprotected admin pages. `/en/admin`, `/bg/admin`, and future management screens must validate the admin session before rendering.
- Localized admin login pages must redirect active admin sessions to the matching localized dashboard.
- Legacy `/admin` and `/admin/login` redirect to English localized admin routes.
- Unknown `/admin/api/*` routes must return JSON `404` responses, not public or admin HTML pages.
- Browser code must never receive or store the backend JWT.
- Do not expose storage keys, local paths, password hashes, tokens, draft data, or admin metadata.
- Do not run dev/build/start/Docker/browser-test commands as routine completion checks.

## API And Types

- Generate frontend API types from backend OpenAPI.
- Keep generated code in the approved generated API folder.
- Generate with `npm run api:generate -w frontend`; this exports backend OpenAPI without starting a dev server.
- Use `src/lib/api` wrappers for all backend calls from routes, components, and features.
- Generated SDK code can include admin routes because it mirrors the full backend OpenAPI. Public frontend code must not import or call admin SDK functions.
- Admin generated SDK functions must be wrapped under `src/lib/admin-api`.
- Browser-facing admin auth helpers live under `src/lib/admin-auth` and call internal `/admin/api/auth/*` routes only.
- Frontend-owned UI copy lives in `frontend/messages/en.json` and `frontend/messages/bg.json`, compiles through Paraglide, and is consumed through `src/lib/i18n/messages.ts`.
- Do not handwrite backend response or DTO types in frontend code.
- Keep frontend-specific view models small and derived from generated types at the API boundary.
- Public pages must handle empty results and backend English fallback metadata without crashing.
- Read public environment values through `src/lib/config`; do not read `process.env.NEXT_PUBLIC_API_BASE_URL` directly in routes, components, or features.

## Rendering Defaults

- Prefer Server Components for public read pages.
- Use Client Components only for interaction, form state, dynamic controls, or browser-only behavior.
- Do not move whole pages to client components to solve a small interactive problem.
- Keep route-level data requirements explicit in the route or feature API wrapper.
- Avoid global mutable client state for public content.
- Use TanStack Query for admin CRUD screens and when client-side refetching, cache invalidation, or optimistic interaction is actually needed.
- Do not use TanStack Query for basic server-rendered public lists/details.

## Forms And Validation

- Use React Hook Form with Zod resolvers for non-trivial forms when frontend forms are introduced.
- Keep form schemas near the feature that owns the form unless two real consumers need a shared schema.
- Validate URL/search params with small helpers before calling API wrappers.
- Do not trust form or query values just because they come from frontend controls.

## Design System

- Build project-owned components under `frontend/src/components/ui` and domain feature folders.
- Tailwind v4 utilities are allowed for project-owned components when they use project theme tokens.
- Use `lucide-react` icons for navigation, search, contact rows, alerts, and common control affordances when an icon is useful.
- Do not add external UI/component libraries such as DSFR, Bootstrap, MUI, Chakra, Ant, or similar packages.
- Mantine is allowed only for the protected admin dashboard under admin route/component files and approved admin feature folders such as `frontend/src/features/admin-news`.
- `@mantine/dropzone` is allowed only for protected admin attachment controls.
- Tiptap is allowed only for protected admin rich text editing in approved admin feature folders.
- Localized admin route files under `frontend/src/app/[locale]/admin` may also import Mantine.
- Admin Mantine components that pass `next/link` as `component={Link}` must be marked as client components.
- Public components, public routes, and public feature code must not import Mantine or admin helpers.
- Do not create `frontend/src/components/dsfr` or use library-owned `fr-*` classes.
- Accessibility is part of the component contract, not a final polish pass.
- Use the `cn` helper for conditional classes in shared UI. Keep class names semantic and avoid complex inline class templates.
- The public visual direction is reference-style civic: dark navy shell, gold accents, cream information bands, white content surfaces, and dense readable public-service layouts.
- Store project color values in `frontend/src/styles/townhall-theme.css` as Tailwind `@theme` tokens and `--townhall-*` compatibility variables.
- Components, routes, and feature files should use tokenized Tailwind classes such as `bg-townhall-navy`, `text-townhall-slate`, and `border-townhall-gold`, not ad hoc hex colors or inline color styles.
- Add new theme tokens only when they describe a stable visual role; do not create one-off color aliases for a single component.

## Localization

- All public routes use `en` or `bg`.
- Frontend-owned UI strings must use Paraglide message files. Do not add handwritten `{ en, bg }` copy objects in source files.
- Missing Bulgarian backend translations may fall back to English. The UI must remain stable.
- Locale switchers should preserve the current route where possible.
- Do not auto-translate in the frontend. Translation happens through backend admin APIs.

## Security

- The public frontend is anonymous.
- Never embed admin tokens in public code.
- Admin JWTs are server-only. Store them only in HttpOnly cookies. Use cookie path `/` so both `/en/admin` and `/bg/admin` can validate the same session.
- Never expose backend secrets through `NEXT_PUBLIC_*`.
- Do not trust URL params or search params. Validate and normalize locale, page, limit, type, and slug inputs.
- Use backend public download routes rather than constructing local storage paths.
- Use protected internal Next admin routes for admin asset preview/download. Do not construct storage paths or direct Nest admin URLs in browser code.
- Persisted admin asset previews must render through protected internal `/admin/api/*` view routes. Unsaved staged file previews may use temporary browser object URLs only and must never be stored in local/session storage.
- For create forms where files require a persisted backend id, stage files in browser memory, create the record first, then upload staged files through protected internal admin API routes. Keep staged files out of local/session storage.
- Sanitize rich HTML with the project `sanitize-html` helper before rendering CMS, news, page, or similar body content.
- Never render unsanitized backend HTML with `dangerouslySetInnerHTML`.

## Performance

- Keep large lists paginated.
- Avoid client waterfalls by fetching route data on the server where possible.
- Keep images/media served through safe backend media routes.
- Use React performance skills for complex component trees, expensive lists, or repeated rerender issues.
- Use the `date-fns` formatting helper for public dates instead of scattering formatter strings across components.

## Testing

- Use Vitest and React Testing Library.
- Keep specs colocated with source files as `*.spec.ts` or `*.spec.tsx`.
- Unit-test API wrappers, locale helpers, and feature formatting.
- Component-test project UI primitives, public feature components, search/forms, and safety rendering rules.
- Use MSW for frontend API wrapper tests.
- Do not test generated API code directly; test the project wrapper around it.
- Avoid snapshot tests as the main proof of behavior.
- Browser tests are opt-in and must not start a dev server.
- Frontend feature work should run `npm run guardrails`, `npm run lint-ci`, `npm run type-check`, and `npm test` from `frontend/` once the app exists.
- Routine type-checking must not depend on live `.next/dev` cache files because the user's dev server may be running independently.
