# Frontend Feature Checklist

Use this checklist before and after frontend feature work.

## Before Coding

- Read `AGENTS.md`, `docs/frontend-architecture.md`, `docs/frontend-guidelines.md`, and `docs/frontend-design-system-policy.md`.
- Identify the route under `frontend/src/app/[locale]`.
- For admin dashboard work, identify the route under `frontend/src/app/[locale]/admin` and read `docs/admin-dashboard-guidelines.md`.
- Identify the feature folder under `frontend/src/features/<feature>`.
- Confirm which backend public API endpoints the feature consumes.
- Confirm generated API types exist or regenerate them with `npm run api:generate -w frontend`.
- Confirm whether the change affects routing, localization, design system usage, auth, security, commands, or docs.
- If the global menu changes, update only `frontend/src/lib/navigation/public-navigation.ts` and its colocated spec.
- Confirm whether the feature needs client fetching, forms, rich HTML rendering, date formatting, or new env values before adding package usage.
- Confirm whether new styling can reuse existing navy/gold civic theme tokens before adding or changing theme values.
- Confirm whether public page mockups under `docs/frontend-design/pages` need regeneration.

## Implementation Checklist

- Route code stays under App Router.
- Public route supports `en` and `bg`.
- Admin page routes are locale-prefixed under `/en/admin` and `/bg/admin`; frontend `/admin/api/*` routes are JSON 404 fallback only.
- Backend calls from pages/components/features go through `src/lib/api` wrappers.
- Admin backend calls go through `src/lib/admin-api` wrappers.
- Public wrappers import only public generated SDK functions needed by the feature.
- Admin generated SDK functions are imported only from `src/lib/admin-api`.
- No handwritten backend DTO/response/entity types are introduced.
- Public frontend does not call `/admin/...`.
- Public frontend does not import `src/components/admin`, `src/lib/admin-api`, or `src/lib/admin-auth`.
- No JWT or auth state is stored in browser storage.
- Admin JWTs stay backend-owned in HttpOnly cookies with path `/`.
- Admin mutations use the approved admin fetch wrapper so `credentials: include` and `x-townhall-csrf` are applied consistently.
- Public UI handles empty backend results.
- Public UI handles English fallback metadata without crashing.
- Header/footer route navigation comes from `src/lib/navigation/public-navigation.ts`, not backend navigation endpoints.
- Header selected/current state uses the actual current pathname.
- Locale root pages stay header/footer-only until a homepage feature batch is explicitly requested.
- Header contact fallback chrome stays in the header unless backend site settings replace it.
- Public shell header/footer fallback settings come from `src/lib/public-site/fallback-settings.ts`.
- Not-found pages reuse the public shell chrome and preserve locale-aware links.
- Admin not-found pages stay protected and render inside admin chrome.
- Localized admin login pages redirect active admin sessions to the matching localized dashboard.
- Legacy `/admin` and `/admin/login` redirect to English localized admin routes.
- Unknown `/admin/api/*` routes return JSON 404 responses.
- Pagination is present for list screens.
- UI primitives stay under `frontend/src/components/ui` or the owning feature folder.
- No external UI/component library imports are added for public UI.
- Mantine imports are allowed only in protected admin route/component files and approved admin feature folders such as `frontend/src/features/admin-news`.
- `@mantine/dropzone` stays admin-only and is used only for protected upload/attachment controls.
- Tiptap imports are allowed only in approved admin rich text editor feature files.
- Frontend-owned UI strings use Paraglide messages through `frontend/src/lib/i18n/messages.ts`; do not add handwritten EN/BG copy objects.
- Tailwind classes use project `townhall-*` theme tokens, not arbitrary hex utilities.
- Runtime env access goes through `src/lib/config`.
- Rich HTML rendering goes through the project sanitizer helper first.
- Public dates use the shared locale-aware date helper.
- Conditional class composition uses the `cn` helper where class logic is not static.
- Color and surface styling uses `frontend/src/styles/townhall-theme.css` tokens and Tailwind `townhall-*` utility classes.
- No ad hoc hex colors or inline color styles are added outside the approved theme file.
- Styling uses project-owned components and design tokens.
- TanStack Query is used for admin CRUD screens and only for other interactive client fetching that needs cache/refetch behavior.
- React Hook Form with Zod/resolvers is used for non-trivial forms.
- Shared UI code has at least two real consumers before moving into shared folders.
- No hardcoded municipality content is added.
- No private backend fields are rendered or passed to components.
- Public page visual changes update static design mockups when page structure changes.

## Test Checklist

- New frontend source under `components`, `features`, `lib`, or public locale routes has a colocated `*.spec.ts` or `*.spec.tsx`, unless it is generated, a style file, an index barrel, or pure type-only file.
- Admin route files, route handlers, components, auth helpers, and API wrappers have colocated `*.spec.ts` or `*.spec.tsx`.
- Admin tests cover localized login redirects, admin language switching, protected admin not-found behavior, legacy redirects, and admin API JSON 404 fallback.
- Locale helpers accept only `en` and `bg`.
- Route/page tests cover empty results where practical.
- API wrapper tests cover query params and safe public endpoints.
- Search uses public localized `/search` routes only.
- Document/media links use safe backend public URLs.
- Admin media/news asset preview and download links use protected backend admin routes through approved wrappers and never expose storage paths or browser-readable JWTs.
- Admin asset preview cards show safe thumbnails/previews for images, PDFs, CSV, text, and JSON where supported; Office and binary files show a safe metadata fallback with open/download actions. Staged pre-save previews use object URLs or browser `File` APIs only.
- Admin create flows that attach files before a persisted id exists stage files only in memory, create the record first, then upload through credentialed backend admin routes.
- Accessibility checks cover header, navigation, language switcher, forms, document lists, and alert banners when these exist.
- Use Vitest, React Testing Library, jest-dom, user-event, jsdom, MSW, and V8 coverage once `frontend/` exists.
- Generated API code is not tested directly; project API wrappers are tested.
- Snapshot tests are not the primary proof of behavior.
- Browser checks run only when explicitly requested and only against `FRONTEND_TEST_BASE_URL`.

## Docs Checklist

- Update `README.md` when setup, commands, ports, or frontend framework choices change.
- Update `AGENTS.md` when durable frontend agent rules change.
- Update `docs/frontend-architecture.md` when structure or routing changes.
- Update `docs/frontend-guidelines.md` when coding rules change.
- Update `docs/frontend-design-system-policy.md` when UI ownership, tokens, or component rules change.
- Update `docs/admin-dashboard-guidelines.md` when protected admin route, auth, Mantine, or admin API wrapper rules change.
- Update `docs/codex-skill-routing.md` when frontend skills change.
- Update `docs/frontend-design/README.md` when mockup page inventory or generation changes.

## Verification Commands

Run from `frontend/` once it exists:

```console
npm run api:generate
npm run i18n:compile
npm run guardrails
npm run lint-ci
npm run type-check
npm test
npm run verify
```

Developer lifecycle commands are available, but they are not routine agent verification commands:

```console
npm run dev
npm run build
npm run start
```

Run from the repo root:

```console
npm run guardrails
```

Do not run these unless explicitly requested:

```console
npm run dev
npm run devs
npm run build
npm start
next dev
next build
next start
pnpm dev
pnpm build
pnpm start
yarn dev
yarn build
yarn start
bun dev
bun run build
turbo dev
turbo build
docker-compose up
docker compose up
```

Browser or Playwright-style checks are opt-in only. They must require an already running app URL:

```console
FRONTEND_TEST_BASE_URL=http://localhost:3000 npm run verify:browser
```

## Docs Drift Check

Update docs in the same change when frontend behavior, architecture, commands, hooks, localization, design system usage, generated API typing, auth, security, or skill routing changes.

If docs stay unchanged, record why in the final response or PR notes.

## Blocked Until Fixed

Do not finish frontend work while any of these are true:

- Next.js Pages Router was added.
- Locale routing does not use `frontend/src/app/[locale]`.
- Public frontend calls an admin API.
- Public frontend imports admin dashboard modules.
- Admin code exposes backend JWTs to browser JavaScript.
- Backend response/DTO types were handwritten.
- Backend calls bypass the API wrapper/generated SDK.
- JWTs or auth state are stored in `localStorage` or `sessionStorage`.
- External public UI/component library imports, `fr-*` classes, or arbitrary hex Tailwind color utilities were added.
- Mantine imports appear outside approved admin route/component files.
- Hardcoded municipality content was added without explicit user request.
- Header/footer menu links were scattered outside `src/lib/navigation/public-navigation.ts`.
- Sensitive backend fields can render publicly.
- Routine verification starts dev servers, runs builds, starts Docker, or runs browser tests.
- `npm run guardrails` fails.
- New frontend source lacks required colocated spec coverage.
