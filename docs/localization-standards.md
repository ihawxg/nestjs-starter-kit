# Localization Standards

Townhall Manipulicity supports English and Bulgarian public content.

## Locale Rules

- Supported locales are `en` and `bg`.
- Default locale is `en`.
- Public unprefixed routes remain English aliases for compatibility.
- Public localized routes use path prefixes such as `/en/news` and `/bg/news`.
- Slugs are shared across languages.
- Missing translations fall back to English and expose `requestedLocale`, `locale`, and `fallbackUsed`.

## Storage Model

- Localized civic text lives in normalized translation tables.
- Translation tables use parent id, `locale`, localized fields, and timestamps.
- Translation tables also store admin-only translation metadata: source, provider, source locale, and machine translation timestamp.
- `(parent_id, locale)` is unique for each translation table.
- Base tables keep shared fields such as slug, status, dates, media references, display order, phone/email, and file metadata.
- Migrations backfill existing text into English translation rows.

## Admin Rules

- Admins may manage translations manually or use configured auto-translation.
- Auto-translation is disabled by default and currently uses DeepL when `AUTO_TRANSLATION_ENABLED=true`, `AUTO_TRANSLATION_PROVIDER=deepl`, and `DEEPL_AUTH_KEY` are configured.
- Generated translations are auto-published, but manual admin edits override machine translations.
- Use optional `sourceLocale` on localized admin create/update DTOs. English is canonical by default; Bulgarian source content must be translated to English before saving base-table fields.
- If `sourceLocale=bg` and auto-translation is disabled or unavailable, reject the request instead of storing Bulgarian text in English canonical fields.
- Rich text fields are translated as HTML and must preserve markup. Oversized rich text may be split by safe block boundaries; unsafe oversized blocks must be translated manually.
- Do not seed localized content or auto-translate content unless an admin action or configured write flow triggers it.
- Translation writes use protected admin routes, JWT auth, admin role guard, audit metadata, and admin write rate limits.
- Updating English translations should keep canonical base-table fields aligned.

## Public Rules

- Public localized routes must still apply the same published/active filtering as unlocalized routes.
- Public responses may include localized text and safe localization metadata.
- Public APIs must not expose draft/private/admin data, storage keys, local paths, provider keys, or translation internals.

## New Domain Checklist

- Add translation table and migration when a public domain exposes user-facing text.
- Add explicit localized public route aliases `en/<domain>` and `bg/<domain>`.
- Add translation admin support or document why the domain is non-textual.
- Add `sourceLocale` support for localized admin create/update DTOs when the domain stores public text.
- Add service tests for Bulgarian response and English fallback.
- Add tests for auto-translation behavior when the domain has admin text writes.
