# Cache Standards

## Goal

Use Redis for deliberate caching, not hidden state. Cache design must be owned by the domain that invalidates it.

Use the installed `redis-core` skill for Redis data modeling and key naming. `redis/agent-skills@redis-best-practices` was not available in the current Redis skill repo; `redis-core` is the closest installed replacement.

## Key Naming

Use lowercase colon-separated keys:

```text
townhall:<domain>:<id>
townhall:<domain>:list:<hash>
townhall:document:<id>:metadata
```

Include enough context to avoid collisions. Do not use full URLs or long raw strings as keys.

## TTL Policy

Every cache entry must define:

- owner domain
- TTL
- invalidation trigger
- public/admin visibility safety

Avoid permanent cache entries unless data is truly immutable.

## Invalidation

Admin writes must invalidate affected public reads. Do not cache unpublished/private data into public keys.

When unsure, prefer no cache over stale or unsafe cache.

## Safety

Do not cache:

- password hashes
- JWTs
- private storage keys
- unpublished documents
- admin-only responses

Cache keys and values should not leak sensitive data.
