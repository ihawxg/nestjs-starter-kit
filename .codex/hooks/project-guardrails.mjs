#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

function gitRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return process.cwd();
  }
}

const root = gitRoot();
const checkers = [
  path.join(root, 'scripts', 'guardrails', 'check-backend-guardrails.mjs'),
  path.join(root, 'scripts', 'guardrails', 'check-frontend-guardrails.mjs'),
];

for (const checker of checkers) {
  const result = spawnSync(process.execPath, [checker, '--hook'], {
    cwd: root,
    stdio: 'inherit',
  });

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

process.exit(0);
