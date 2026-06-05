#!/usr/bin/env node

console.log([
  'Townhall project context:',
  '- AGENTS.md is the always-loaded project contract.',
  '- Before backend edits, route through docs/feature-checklist.md.',
  '- Before frontend edits, route through docs/frontend-feature-checklist.md.',
  '- Architecture: docs/architecture-standards.md and docs/core-module-policy.md.',
  '- Frontend: docs/frontend-architecture.md, docs/frontend-guidelines.md, and docs/dsfr-usage-policy.md.',
  '- Data/cache/security: docs/database-standards.md, docs/cache-standards.md, docs/security-standards.md.',
  '- Living docs: update docs with behavior, schema, auth, cache, storage, command, hook, or domain-scope changes.',
  '- Routine checks: npm run guardrails, npm run lint-ci, npm test, npm run type-check, npm run verify. Do not run build/dev/start/Docker or browser tests unless explicitly requested.',
].join('\n'));
