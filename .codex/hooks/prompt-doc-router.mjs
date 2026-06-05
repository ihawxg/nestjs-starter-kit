#!/usr/bin/env node

import process from 'node:process';

const chunks = [];
for await (const chunk of process.stdin) {
  chunks.push(Buffer.from(chunk));
}

const prompt = Buffer.concat(chunks).toString('utf8').toLowerCase();
const routes = new Set();

function addIf(pattern, docs) {
  if (pattern.test(prompt)) {
    for (const doc of docs) routes.add(doc);
  }
}

addIf(/auth|admin|role|guard|jwt|permission|public|private/, [
  'docs/security-standards.md',
  'docs/backend-guidelines.md',
]);
addIf(/database|postgres|typeorm|migration|entity|schema|index|query|pagination|explain/, [
  'docs/database-standards.md',
  'docs/codex-skill-routing.md',
]);
addIf(/cache|redis|ttl|invalidation|key/, [
  'docs/cache-standards.md',
  'docs/codex-skill-routing.md',
]);
addIf(/core|shared|util|helper|architecture|module|structure|boundary/, [
  'docs/architecture-standards.md',
  'docs/core-module-policy.md',
]);
addIf(/document|file|download|upload|storage/, [
  'docs/security-standards.md',
  'docs/backend-guidelines.md',
]);
addIf(/hook|codex|agent|skill|guardrail|verify|build|dev|start|docker/, [
  'AGENTS.md',
  'docs/hook-context-policy.md',
  'docs/codex-skill-routing.md',
]);
addIf(/docs|documentation|roadmap|domain|scope/, [
  'docs/living-docs-policy.md',
  'docs/domain-roadmap.md',
]);
addIf(/frontend|next|nextjs|react|app router|server component|client component|tanstack|query|openapi|hey api|typescript type|dsfr|design system|accessibility|a11y|seo|route|cookie|browser|playwright/, [
  'docs/frontend-architecture.md',
  'docs/frontend-guidelines.md',
  'docs/frontend-feature-checklist.md',
  'docs/dsfr-usage-policy.md',
  'docs/codex-skill-routing.md',
]);

if (routes.size === 0) {
  process.exit(0);
}

console.log([
  'Project doc routing reminder:',
  ...[...routes].sort().map((doc) => `- Read/update ${doc} if this task changes its area.`),
  '- Use docs/feature-checklist.md before finishing backend work.',
  '- Use docs/frontend-feature-checklist.md before finishing frontend work.',
].join('\n'));
