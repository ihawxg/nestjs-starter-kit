#!/usr/bin/env node

console.log([
  'Townhall backend context:',
  '- AGENTS.md is the always-loaded project contract.',
  '- Before backend edits, route through docs/feature-checklist.md.',
  '- Architecture: docs/architecture-standards.md and docs/core-module-policy.md.',
  '- Data/cache/security: docs/database-standards.md, docs/cache-standards.md, docs/security-standards.md.',
  '- Living docs: update docs with behavior, schema, auth, cache, storage, command, hook, or domain-scope changes.',
  '- Routine checks: npm run guardrails, npm run lint-ci, npm test, npm run verify. Do not run build/dev/start/Docker unless explicitly requested.',
].join('\n'));
