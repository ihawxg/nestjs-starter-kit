#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = new Set(process.argv.slice(2));
const hookMode = args.has('--hook');

const fail = [];
const warn = [];

function runGit(args, options = {}) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      ...options,
    }).trim();
  } catch {
    return '';
  }
}

function findRepoRoot() {
  const gitRoot = runGit(['rev-parse', '--show-toplevel']);
  if (gitRoot) return gitRoot;

  let current = process.cwd();
  while (current !== path.dirname(current)) {
    if (existsSync(path.join(current, 'api', 'src'))) return current;
    current = path.dirname(current);
  }
  return process.cwd();
}

const root = findRepoRoot();
const apiRoot = path.join(root, 'api');
const srcRoot = path.join(apiRoot, 'src');
const allowedInfra = new Set([
  'app-cache',
  'core',
  'db',
  'global',
  'health',
  'logger',
  'services',
  'storage',
  'user',
]);

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === 'coverage') continue;
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function read(file) {
  return readFileSync(file, 'utf8');
}

function normalizeGitPath(file) {
  if (!file) return file;
  if (path.isAbsolute(file)) return rel(file);
  const cwdAbsolute = path.resolve(process.cwd(), file);
  const absolute = existsSync(cwdAbsolute) ? cwdAbsolute : path.join(root, file);
  return rel(absolute);
}

function changedFiles() {
  const staged = runGit(['diff', '--name-only', '--cached']).split('\n').filter(Boolean);
  const unstaged = runGit(['diff', '--name-only']).split('\n').filter(Boolean);
  const untracked = runGit(['ls-files', '--others', '--exclude-standard'])
    .split('\n')
    .filter(Boolean);
  return [...new Set([...staged, ...unstaged, ...untracked].map(normalizeGitPath))];
}

function changedFilesSinceHead() {
  const changed = runGit(['diff', '--name-only', 'HEAD'])
    .split('\n')
    .filter(Boolean)
    .map(normalizeGitPath);
  return [...new Set([...changed, ...changedFiles()])];
}

function topLevelSourceChecks() {
  if (!existsSync(srcRoot)) {
    fail.push('Missing backend source root: api/src');
    return;
  }

  const changed = changedFilesSinceHead();
  const misplacedBackend = changed.filter((file) => {
    if (!file.startsWith('api/')) return false;
    if (file.startsWith('api/src/') || file.startsWith('api/test/')) return false;
    if (!file.endsWith('.ts')) return false;
    return ![
      'api/type-orm.config.ts',
    ].includes(file);
  });

  for (const file of misplacedBackend) {
    fail.push(`Backend source must stay under api/src: ${file}`);
  }
}

function domainShapeChecks() {
  const dirs = readdirSync(srcRoot)
    .map((entry) => path.join(srcRoot, entry))
    .filter((entry) => statSync(entry).isDirectory());

  for (const dir of dirs) {
    const domain = path.basename(dir);
    const tsFiles = walk(dir).filter((file) => file.endsWith('.ts'));
    if (tsFiles.length === 0) {
      warn.push(`Empty source directory allowed for now: ${rel(dir)}`);
      continue;
    }

    if (allowedInfra.has(domain)) continue;

    const moduleFile = path.join(dir, `${domain}.module.ts`);
    if (!existsSync(moduleFile)) {
      fail.push(`Domain folder with TypeScript code needs ${domain}.module.ts: ${rel(dir)}`);
    }

    for (const file of tsFiles) {
      const base = path.basename(file);
      const relativeInsideDomain = path.relative(dir, file).replaceAll(path.sep, '/');

      if (base.endsWith('.dto.ts') && !relativeInsideDomain.startsWith('dto/')) {
        fail.push(`DTO files must live under dto/: ${rel(file)}`);
      }

      if (base.endsWith('.entity.ts') && !relativeInsideDomain.startsWith('entities/')) {
        fail.push(`Entity files must live under entities/: ${rel(file)}`);
      }

      if (base.endsWith('.entity.ts')) {
        const entityText = read(file);
        const isImmutableAuditLogEntity = domain === 'audit-log' && base === 'audit-log.entity.ts';
        if (
          !isImmutableAuditLogEntity &&
          (!/(createdAt|created_at)/.test(entityText) || !/(updatedAt|updated_at)/.test(entityText))
        ) {
          fail.push(`Domain entity must include created/updated timestamp policy: ${rel(file)}`);
        }
        const isAssetJoinEntity = base.endsWith('-asset.entity.ts');
        if (
          !isImmutableAuditLogEntity &&
          !isAssetJoinEntity &&
          !/(published|isPublished|status|visibility|isActive)/i.test(entityText)
        ) {
          fail.push(`Domain entity must include publish/visibility state policy: ${rel(file)}`);
        }
      }

      if (base.endsWith('.controller.ts')) {
        const nested = relativeInsideDomain.includes('/');
        if (!nested && base !== `${domain}.controller.ts`) {
          fail.push(`Root controller must be named ${domain}.controller.ts: ${rel(file)}`);
        }
      }
    }
  }
}

function controllerChecks() {
  const controllers = walk(srcRoot).filter((file) => file.endsWith('.controller.ts'));
  const roleGuardExists = walk(srcRoot).some((file) => {
    if (!file.endsWith('.ts')) return false;
    return /RolesGuard|RoleGuard|AdminGuard|Roles\(/.test(read(file));
  });

  for (const file of controllers) {
    const text = read(file);
    const relative = rel(file);

    const entityBodyMatches = text.match(/@Body\s*\([^)]*\)\s*[A-Za-z0-9_$]+\s*:\s*[A-Za-z0-9_$]*Entity\b/g) ?? [];
    for (const match of entityBodyMatches) {
      fail.push(`Controller request body must use DTO, not entity: ${relative} (${match.trim()})`);
    }

    const leaks = ['passwordHash', 'storageKey', 'stack', 'internalPath'];
    const hasTokenLeak = /\btoken\b/.test(text) && !relative.includes('/user/');
    const foundLeaks = leaks.filter((term) => text.includes(term));
    if (hasTokenLeak) foundLeaks.push('token');

    if (foundLeaks.length > 0) {
      if (relative.includes('/user/')) {
        warn.push(`Legacy user controller contains sensitive field names: ${relative} (${foundLeaks.join(', ')})`);
      } else {
        fail.push(`Controller may leak private fields: ${relative} (${foundLeaks.join(', ')})`);
      }
    }

    const hasWriteRoute = /@(Post|Patch|Put|Delete)\s*\(/.test(text);
    const isAdminWriteController =
      /@Controller\s*\(\s*['"`]admin\//.test(text) ||
      /\/controllers\/.*-admin\.controller\.ts$/.test(relative);
    const publicListRouteMatches = [...text.matchAll(/(?:@\w+[^\n]*\n\s*)*@Get\s*\(\s*(?:['"`][/'"`]*['"`])?\s*\)[\s\S]{0,500}?\b(?:get|list|findAll|search)[A-Za-z0-9_]*\s*\(/g)];
    for (const match of publicListRouteMatches) {
      if (relative.includes('/site-settings/')) continue;

      const routeContext = text.slice(match.index ?? 0, (match.index ?? 0) + 800);
      const guarded = /@UseGuards\s*\(/.test(routeContext);
      const hasPagination = /(@Query|Pagination|pagination|page|limit|take|skip|cursor|query)/i.test(routeContext);
      if (!guarded && !hasPagination) {
        fail.push(`Public list endpoint needs explicit pagination/query policy: ${relative}`);
      }
    }

    if (!hasWriteRoute || !isAdminWriteController) continue;

    if (!roleGuardExists) {
      warn.push(`Role guard not implemented yet; write-route guard enforcement deferred: ${relative}`);
      continue;
    }

    if (!/@UseGuards\s*\([^)]*(Role|Admin|Jwt)[^)]*\)/s.test(text)) {
      fail.push(`Write-route controller needs JWT/admin guard coverage: ${relative}`);
    }
  }
}

function migrationChecks() {
  const changed = changedFilesSinceHead();
  const entityChanged = changed.some((file) => file.startsWith('api/src/') && file.endsWith('.entity.ts'));
  const migrationChanged = changed.some((file) => file.startsWith('api/src/db/migrations/') && file.endsWith('.ts'));

  if (entityChanged && !migrationChanged) {
    fail.push('Entity files changed without a matching TypeORM migration under api/src/db/migrations.');
  }
}

function configLooseningChecks() {
  const changed = changedFilesSinceHead();
  const configFiles = ['api/eslint.config.mjs', 'api/tsconfig.json'];
  for (const file of configFiles) {
    if (!changed.includes(file)) continue;
    const diff = runGit(['diff', 'HEAD', '--', file]);
    const riskyRemoval = diff
      .split('\n')
      .some((line) => line.startsWith('-') && /noImplicitAny|strictNullChecks|no-unused-vars|no-restricted-imports|eslint|strict/i.test(line));

    if (riskyRemoval) {
      fail.push(`Lint/TypeScript strictness appears loosened; document explicit project reason: ${file}`);
    } else {
      warn.push(`Lint/TypeScript config changed; verify strictness stayed intact: ${file}`);
    }
  }
}

function packageScriptChecks() {
  const packageJson = path.join(apiRoot, 'package.json');
  if (!existsSync(packageJson)) {
    fail.push('Missing api/package.json.');
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(read(packageJson));
  } catch {
    fail.push('api/package.json must be valid JSON.');
    return;
  }

  const scripts = parsed.scripts ?? {};
  if (!scripts.guardrails?.includes('../scripts/guardrails/check-backend-guardrails.mjs')) {
    fail.push('api/package.json script "guardrails" must run the backend guardrail checker.');
  }

  const routineScripts = ['guardrails', 'verify', 'verify:full', 'lint-ci', 'test'];
  const blockedRoutinePattern = /\b(npm\s+run\s+build|npm\s+run\s+start:dev|npm\s+run\s+dev|npm\s+start|nest\s+build|nest\s+start|docker(?:-compose|\s+compose)\s+up)\b/i;
  for (const scriptName of routineScripts) {
    const script = scripts[scriptName] ?? '';
    if (blockedRoutinePattern.test(script)) {
      fail.push(`Routine script "${scriptName}" must not run build/dev/start/Docker commands.`);
    }
  }
}

function livingDocsChecks() {
  const changed = changedFilesSinceHead();
  const backendChanged = changed.some((file) => (
    file.startsWith('api/src/') ||
    file.startsWith('api/test/') ||
    file === 'api/package.json' ||
    file.startsWith('.codex/hooks') ||
    file.startsWith('scripts/guardrails/')
  ));
  const docsChanged = changed.some((file) => (
    file === 'AGENTS.md' ||
    file === 'README.md' ||
    file.startsWith('docs/')
  ));

  if (backendChanged && !docsChanged) {
    warn.push('Backend/guardrail source changed without docs changes. Update docs or report why docs were not needed.');
  }
}

topLevelSourceChecks();
domainShapeChecks();
controllerChecks();
migrationChecks();
configLooseningChecks();
packageScriptChecks();
livingDocsChecks();

for (const message of warn) {
  console.warn(`guardrail warning: ${message}`);
}

if (fail.length > 0) {
  console.error('\nBackend guardrails failed:');
  for (const message of fail) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

const suffix = hookMode ? ' (hook)' : '';
console.log(`Backend guardrails passed${suffix}.`);
