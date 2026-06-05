# Frontend Feature Checklist

Use this checklist before and after frontend feature work.

## Before Coding

- Read `AGENTS.md`, `docs/frontend-architecture.md`, `docs/frontend-guidelines.md`, and `docs/dsfr-usage-policy.md`.
- Identify the route under `frontend/src/app/[locale]`.
- Identify the feature folder under `frontend/src/features/<feature>`.
- Confirm which backend public API endpoints the feature consumes.
- Confirm generated API types exist or regenerate them from backend OpenAPI.
- Confirm whether the change affects routing, localization, design system usage, auth, security, commands, or docs.

## Implementation Checklist

- Route code stays under App Router.
- Public route supports `en` and `bg`.
- Backend calls go through generated API code or `src/lib/api` wrappers.
- No handwritten backend DTO/response/entity types are introduced.
- Public frontend does not call `/admin/...`.
- No JWT or auth state is stored in browser storage.
- Public UI handles empty backend results.
- Public UI handles English fallback metadata without crashing.
- Pagination is present for list screens.
- DSFR imports stay inside local wrappers/providers.
- Shared UI code has at least two real consumers before moving into shared folders.
- No hardcoded municipality content is added.
- No private backend fields are rendered or passed to components.

## Test Checklist

- Locale helpers accept only `en` and `bg`.
- Route/page tests cover empty results where practical.
- API wrapper tests cover query params and safe public endpoints.
- Search uses public localized `/search` routes only.
- Document/media links use safe backend public URLs.
- Accessibility checks cover header, navigation, language switcher, forms, document lists, and alert banners when these exist.
- Browser checks run only when explicitly requested and only against `FRONTEND_TEST_BASE_URL`.

## Docs Checklist

- Update `README.md` when setup, commands, ports, or frontend framework choices change.
- Update `AGENTS.md` when durable frontend agent rules change.
- Update `docs/frontend-architecture.md` when structure or routing changes.
- Update `docs/frontend-guidelines.md` when coding rules change.
- Update `docs/dsfr-usage-policy.md` when DSFR authorization or usage changes.
- Update `docs/codex-skill-routing.md` when frontend skills change.

## Verification Commands

Run from `frontend/` once it exists:

```console
npm run guardrails
npm run lint-ci
npm run type-check
npm test
npm run verify
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
- Backend response/DTO types were handwritten.
- Backend calls bypass the API wrapper/generated SDK.
- JWTs or auth state are stored in `localStorage` or `sessionStorage`.
- DSFR imports bypass local wrappers/providers.
- Hardcoded municipality content was added without explicit user request.
- Sensitive backend fields can render publicly.
- Routine verification starts dev servers, runs builds, starts Docker, or runs browser tests.
- `npm run guardrails` fails.
