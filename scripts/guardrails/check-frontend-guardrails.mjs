#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";

const args = new Set(process.argv.slice(2));
const hookMode = args.has("--hook");

const fail = [];
const warn = [];

function runGit(args, options = {}) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      ...options,
    }).trim();
  } catch {
    return "";
  }
}

function findRepoRoot() {
  const gitRoot = runGit(["rev-parse", "--show-toplevel"]);
  if (gitRoot) return gitRoot;

  let current = process.cwd();
  while (current !== path.dirname(current)) {
    if (existsSync(path.join(current, "AGENTS.md"))) return current;
    current = path.dirname(current);
  }
  return process.cwd();
}

const root = findRepoRoot();
const frontendRoot = path.join(root, "frontend");
const srcRoot = path.join(frontendRoot, "src");
const generatedRoots = [
  "frontend/src/generated/",
  "frontend/src/lib/api/generated/",
  "frontend/src/lib/api/hey/",
];
const apiWrapperRoots = [
  "frontend/src/lib/api/",
  "frontend/src/server/api/",
  "frontend/src/generated/",
];
const dsfrWrapperRoots = [
  "frontend/src/components/dsfr/",
  "frontend/src/components/ui/",
  "frontend/src/lib/dsfr/",
  "frontend/src/app/providers.",
  "frontend/src/app/dsfr-provider.",
  "frontend/src/app/layout.",
];
const allowedRootSourceFiles = new Set([
  "frontend/next-env.d.ts",
  "frontend/next.config.js",
  "frontend/next.config.mjs",
  "frontend/next.config.ts",
  "frontend/eslint.config.js",
  "frontend/eslint.config.mjs",
  "frontend/eslint.config.ts",
  "frontend/postcss.config.js",
  "frontend/postcss.config.mjs",
  "frontend/tailwind.config.js",
  "frontend/tailwind.config.ts",
  "frontend/vitest.config.ts",
  "frontend/vitest.setup.ts",
]);

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function read(file) {
  return readFileSync(file, "utf8");
}

function walk(dir) {
  if (!existsSync(dir)) return [];

  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);

    if (st.isDirectory()) {
      if (
        entry === "node_modules" ||
        entry === ".next" ||
        entry === "dist" ||
        entry === "coverage" ||
        entry === ".turbo"
      ) {
        continue;
      }
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }

  return out;
}

function parseJson(file, label) {
  try {
    return JSON.parse(read(file));
  } catch {
    fail.push(`${label} must be valid JSON.`);
    return undefined;
  }
}

function normalizeGitPath(file) {
  if (!file) return file;
  if (path.isAbsolute(file)) return rel(file);

  const cwdAbsolute = path.resolve(process.cwd(), file);
  const absolute = existsSync(cwdAbsolute)
    ? cwdAbsolute
    : path.join(root, file);
  return rel(absolute);
}

function changedFiles() {
  const staged = runGit(["diff", "--name-only", "--cached"])
    .split("\n")
    .filter(Boolean);
  const unstaged = runGit(["diff", "--name-only"]).split("\n").filter(Boolean);
  const untracked = runGit(["ls-files", "--others", "--exclude-standard"])
    .split("\n")
    .filter(Boolean);

  return [
    ...new Set([...staged, ...unstaged, ...untracked].map(normalizeGitPath)),
  ];
}

function changedFilesSinceHead() {
  const changed = runGit(["diff", "--name-only", "HEAD"])
    .split("\n")
    .filter(Boolean)
    .map(normalizeGitPath);
  return [...new Set([...changed, ...changedFiles()])];
}

function scriptContainsBlockedCommand(script) {
  return /\b(npm\s+run\s+(dev|devs|build|start|start:dev|start:debug|start:prod)|npm\s+(start|run-script\s+(dev|devs|build|start|start:dev|start:debug|start:prod))|next\s+(dev|build|start)|pnpm\s+(dev|build|start)|yarn\s+(dev|build|start)|bun\s+(dev|run\s+build)|turbo\s+(dev|build)|nest\s+(start|build)|docker(?:-compose|\s+compose)\s+up)\b/i.test(
    script,
  );
}

function scriptContainsBrowserTest(script) {
  return /\b(playwright|cypress|browser-test|browser:|verify:browser)\b/i.test(
    script,
  );
}

function rootWorkspaceChecks() {
  const packageJson = path.join(root, "package.json");
  if (!existsSync(packageJson)) {
    fail.push("Missing root package.json for api/frontend workspace guardrails.");
    return;
  }

  const parsed = parseJson(packageJson, "Root package.json");
  if (!parsed) return;

  if (parsed.private !== true) {
    fail.push("Root package.json must be private for workspace usage.");
  }

  const workspaces = Array.isArray(parsed.workspaces)
    ? parsed.workspaces
    : parsed.workspaces?.packages;
  if (!Array.isArray(workspaces)) {
    fail.push("Root package.json must define npm workspaces.");
  } else {
    for (const workspace of ["api", "frontend"]) {
      if (!workspaces.includes(workspace)) {
        fail.push(`Root package.json workspaces must include "${workspace}".`);
      }
    }
  }

  const scripts = parsed.scripts ?? {};
  const requiredScripts = ["guardrails", "verify", "verify:backend", "verify:frontend"];
  for (const scriptName of requiredScripts) {
    if (!scripts[scriptName]) {
      fail.push(`Root package.json missing script "${scriptName}".`);
    }
  }

  for (const [scriptName, script] of Object.entries(scripts)) {
    if (
      ["guardrails", "verify", "verify:backend", "verify:frontend"].includes(
        scriptName,
      ) &&
      scriptContainsBlockedCommand(script)
    ) {
      fail.push(
        `Root routine script "${scriptName}" must not run dev/build/start/Docker commands.`,
      );
    }
  }

  if (existsSync(frontendRoot)) {
    const frontendDelegates = /(-w|--workspace)\s+frontend\b/.test(
      scripts["verify:frontend"] ?? "",
    );
    if (!frontendDelegates) {
      fail.push(
        'Root script "verify:frontend" must delegate to the frontend workspace once frontend/ exists.',
      );
    }
  }
}

function frontendPackageChecks() {
  if (!existsSync(frontendRoot)) {
    warn.push("frontend/ does not exist yet; frontend guardrails are ready for scaffold.");
    return;
  }

  const packageJson = path.join(frontendRoot, "package.json");
  if (!existsSync(packageJson)) {
    fail.push("frontend/package.json is required once frontend/ exists.");
    return;
  }

  const parsed = parseJson(packageJson, "frontend/package.json");
  if (!parsed) return;

  const scripts = parsed.scripts ?? {};
  const requiredScripts = ["guardrails", "verify", "lint-ci", "type-check", "test"];
  for (const scriptName of requiredScripts) {
    if (!scripts[scriptName]) {
      fail.push(`frontend/package.json missing script "${scriptName}".`);
    }
  }

  for (const [scriptName, script] of Object.entries(scripts)) {
    if (
      ["guardrails", "verify", "lint-ci", "type-check", "test"].includes(
        scriptName,
      ) &&
      scriptContainsBlockedCommand(script)
    ) {
      fail.push(
        `Frontend routine script "${scriptName}" must not run dev/build/start/Docker commands.`,
      );
    }

    if (
      ["guardrails", "verify", "lint-ci", "type-check", "test"].includes(
        scriptName,
      ) &&
      scriptContainsBrowserTest(script)
    ) {
      fail.push(
        `Frontend routine script "${scriptName}" must not run browser/Playwright-style tests.`,
      );
    }
  }

  const browserScript = scripts["verify:browser"];
  if (browserScript) {
    if (!/FRONTEND_TEST_BASE_URL/.test(browserScript)) {
      fail.push(
        "frontend verify:browser must require FRONTEND_TEST_BASE_URL and must not start a dev server.",
      );
    }

    if (scriptContainsBlockedCommand(browserScript)) {
      fail.push(
        "frontend verify:browser must not run dev/build/start/Docker commands.",
      );
    }
  }
}

function appRouterChecks() {
  if (!existsSync(frontendRoot)) return;

  if (existsSync(path.join(frontendRoot, "pages"))) {
    fail.push("Next.js Pages Router is not allowed: frontend/pages");
  }

  if (existsSync(path.join(srcRoot, "pages"))) {
    fail.push("Next.js Pages Router is not allowed: frontend/src/pages");
  }

  if (!existsSync(path.join(srcRoot, "app"))) {
    fail.push("Next.js frontend source must use App Router under frontend/src/app.");
  }

  if (!existsSync(path.join(srcRoot, "app", "[locale]"))) {
    fail.push("Public locale routing must live under frontend/src/app/[locale].");
  }

  for (const locale of ["en", "bg"]) {
    if (existsSync(path.join(srcRoot, "app", locale))) {
      fail.push(
        `Hardcoded locale app folder is not allowed; use frontend/src/app/[locale], not ${locale}.`,
      );
    }
  }
}

function sourcePlacementChecks() {
  if (!existsSync(frontendRoot)) return;

  const files = walk(frontendRoot).filter((file) =>
    /\.(ts|tsx|js|jsx|css|scss)$/.test(file),
  );

  for (const file of files) {
    const relative = rel(file);
    if (relative.startsWith("frontend/src/")) continue;
    if (allowedRootSourceFiles.has(relative)) continue;

    fail.push(
      `Frontend source must stay under frontend/src unless it is a config file: ${relative}`,
    );
  }
}

function generatedApiChecks() {
  if (!existsSync(frontendRoot)) return;

  const files = walk(frontendRoot).filter((file) =>
    /\.(ts|tsx|js|jsx)$/.test(file),
  );

  for (const file of files) {
    const relative = rel(file);
    const isGenerated = generatedRoots.some((prefix) =>
      relative.startsWith(prefix),
    );
    const isApiWrapper = apiWrapperRoots.some((prefix) =>
      relative.startsWith(prefix),
    );
    const text = read(file);

    if (
      /(?:^|\n)\s*(?:export\s+)?(?:interface|type)\s+\w*(Dto|DTO|Response|Entity|Payload)\b/.test(
        text,
      ) &&
      !isGenerated
    ) {
      fail.push(
        `Do not handwrite backend response/DTO-style types outside generated API code: ${relative}`,
      );
    }

    if (/\/admin\//.test(text) && !relative.startsWith("frontend/src/app/admin/")) {
      fail.push(`Public frontend code must not call admin APIs: ${relative}`);
    }

    if (/\bfetch\s*\(/.test(text) && !isApiWrapper) {
      fail.push(
        `Backend fetch calls must go through the generated API wrapper: ${relative}`,
      );
    }
  }
}

function clientSecurityChecks() {
  if (!existsSync(frontendRoot)) return;

  const files = walk(frontendRoot).filter((file) =>
    /\.(ts|tsx|js|jsx)$/.test(file),
  );
  const sensitiveTerms = [
    "passwordHash",
    "storageKey",
    "localPath",
    "absolutePath",
    "internalPath",
    "stackTrace",
  ];

  for (const file of files) {
    const relative = rel(file);
    const text = read(file);

    if (/\b(localStorage|sessionStorage)\b/.test(text)) {
      fail.push(
        `Do not store or read auth state from browser storage: ${relative}`,
      );
    }

    if (
      /document\.cookie/.test(text) &&
      !relative.startsWith("frontend/src/server/") &&
      !relative.startsWith("frontend/src/lib/auth/")
    ) {
      fail.push(
        `Do not manage auth cookies in public/client code; future admin auth must use HttpOnly cookies: ${relative}`,
      );
    }

    const foundTerms = sensitiveTerms.filter((term) => text.includes(term));
    if (foundTerms.length > 0) {
      fail.push(
        `Frontend must not render or depend on private backend fields: ${relative} (${foundTerms.join(", ")})`,
      );
    }
  }
}

function dsfrChecks() {
  if (!existsSync(frontendRoot)) return;

  const files = walk(frontendRoot).filter((file) =>
    /\.(ts|tsx|js|jsx|css|scss)$/.test(file),
  );

  for (const file of files) {
    const relative = rel(file);
    const text = read(file);
    const importsDsfr =
      /@gouvfr\/dsfr|@codegouvfr\/react-dsfr|dsfr\.min|dsfr\.module/.test(
        text,
      );

    if (!importsDsfr) continue;

    const allowed = dsfrWrapperRoots.some((prefix) =>
      relative.startsWith(prefix),
    );
    if (!allowed) {
      fail.push(
        `DSFR imports must go through local design-system wrappers/providers: ${relative}`,
      );
    }
  }
}

function contentHardcodingChecks() {
  if (!existsSync(frontendRoot)) return;

  const files = walk(srcRoot).filter((file) => /\.(ts|tsx|js|jsx)$/.test(file));
  const suspiciousContent = [
    "Стратегически документи",
    "ПРОЕКТИ",
    "Нормативни документи",
    "ОБЩИНСКА СОБСТВЕНОСТ",
    "Budget and finance",
    "Municipal property",
    "Departments",
  ];

  for (const file of files) {
    const relative = rel(file);
    if (relative.includes("/tests/") || relative.endsWith(".test.tsx")) {
      continue;
    }

    const text = read(file);
    const found = suspiciousContent.filter((term) => text.includes(term));
    if (found.length > 0) {
      warn.push(
        `Frontend may contain hardcoded municipality content; content should come from public APIs: ${relative} (${found.join(", ")})`,
      );
    }
  }
}

function configStrictnessChecks() {
  const changed = changedFilesSinceHead();
  const configFiles = [
    "frontend/eslint.config.mjs",
    "frontend/eslint.config.js",
    "frontend/eslint.config.ts",
    "frontend/tsconfig.json",
    "frontend/next.config.mjs",
    "frontend/next.config.js",
    "frontend/next.config.ts",
  ];

  for (const file of configFiles) {
    if (!changed.includes(file)) continue;

    const diff = runGit(["diff", "HEAD", "--", file]);
    const riskyRemoval = diff.split("\n").some(
      (line) =>
        line.startsWith("-") &&
        /strict|noImplicitAny|strictNullChecks|eslint|no-unused-vars|typescript|ignoreBuildErrors/i.test(
          line,
        ),
    );

    if (riskyRemoval) {
      fail.push(
        `Frontend lint/TypeScript strictness appears loosened; document explicit project reason: ${file}`,
      );
    } else {
      warn.push(
        `Frontend config changed; verify strictness and guardrails stayed intact: ${file}`,
      );
    }
  }
}

function livingDocsChecks() {
  const changed = changedFilesSinceHead();
  const frontendChanged = changed.some(
    (file) =>
      file.startsWith("frontend/") ||
      file === "package.json" ||
      file.startsWith(".codex/hooks") ||
      file === "scripts/guardrails/check-frontend-guardrails.mjs",
  );
  const docsChanged = changed.some(
    (file) =>
      file === "AGENTS.md" || file === "README.md" || file.startsWith("docs/"),
  );

  if (frontendChanged && !docsChanged) {
    warn.push(
      "Frontend/guardrail source changed without docs changes. Update docs or report why docs were not needed.",
    );
  }
}

rootWorkspaceChecks();
frontendPackageChecks();
appRouterChecks();
sourcePlacementChecks();
generatedApiChecks();
clientSecurityChecks();
dsfrChecks();
contentHardcodingChecks();
configStrictnessChecks();
livingDocsChecks();

for (const message of warn) {
  console.warn(`frontend guardrail warning: ${message}`);
}

if (fail.length > 0) {
  console.error("\nFrontend guardrails failed:");
  for (const message of fail) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

const suffix = hookMode ? " (hook)" : "";
console.log(`Frontend guardrails passed${suffix}.`);
