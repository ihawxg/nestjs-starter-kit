#!/usr/bin/env node

import process from 'node:process';

const chunks = [];
for await (const chunk of process.stdin) {
  chunks.push(Buffer.from(chunk));
}

const input = Buffer.concat(chunks).toString('utf8');

if (!input.trim()) {
  process.exit(0);
}

if (/\bTOWNHALL_ALLOW_DEV_BUILD=1\b/.test(input)) {
  process.exit(0);
}

const blockedPatterns = [
  /\bnpm\s+run\s+(dev|start|start:dev|start:debug|start:prod|build)\b/i,
  /\bnpm\s+(start|run-script\s+(dev|start|start:dev|start:debug|start:prod|build))\b/i,
  /\bnest\s+(start|build)\b/i,
  /\bnode\s+dist\/main\b/i,
  /\bdocker(?:-compose|\s+compose)\s+up\b/i,
];

if (blockedPatterns.some((pattern) => pattern.test(input))) {
  console.error([
    'Blocked by project guardrail.',
    'Do not run dev servers, production starts, Docker environment starts, or build commands after normal code completion.',
    'Use npm run guardrails, npm run lint-ci, npm test, or npm run verify instead.',
    'Run dev/build/start commands only when the user explicitly asks for that exact command, and prefix it with TOWNHALL_ALLOW_DEV_BUILD=1.',
  ].join('\n'));
  process.exit(1);
}

process.exit(0);
