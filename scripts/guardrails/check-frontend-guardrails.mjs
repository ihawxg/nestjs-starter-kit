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
  "frontend/src/lib/i18n/paraglide/",
];
const apiWrapperRoots = [
  "frontend/src/lib/api/",
  "frontend/src/lib/admin-api/",
  "frontend/src/lib/admin-auth/",
  "frontend/src/server/api/",
  "frontend/src/generated/",
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
  "frontend/vitest.config.mts",
  "frontend/vitest.setup.ts",
  "frontend/vitest.setup.tsx",
]);
const themeFile = "frontend/src/styles/townhall-theme.css";
const approvedColorFiles = new Set([themeFile]);
const forbiddenUiDependencies = [
  "@codegouvfr/react-dsfr",
  "@gouvfr/dsfr",
  "@mui/material",
  "@chakra-ui/react",
  "antd",
  "bootstrap",
  "react-bootstrap",
  "semantic-ui-react",
];
const requiredAdminUiDependencies = [
  "@mantine/core",
  "@mantine/hooks",
  "@mantine/form",
  "@mantine/modals",
  "@mantine/notifications",
  "@mantine/dropzone",
  "@mantine/tiptap",
];
const forbiddenLocalizationDependencies = ["next-intl"];
const forbiddenUiImportPattern =
  /@gouvfr\/dsfr|@codegouvfr\/react-dsfr|dsfr\.min|dsfr\.module|@mui\/material|@chakra-ui\/react|antd|bootstrap|react-bootstrap|semantic-ui-react/;
const mantineImportPattern = /@mantine\//;
const tiptapImportPattern = /@tiptap\//;
const adminSourcePrefixes = [
  "frontend/src/app/admin/",
  "frontend/src/app/[locale]/admin/",
  "frontend/src/components/admin/",
  "frontend/src/features/admin-news/",
  "frontend/src/lib/admin-api/",
  "frontend/src/lib/admin-auth/",
  "frontend/src/lib/i18n/",
];
const publicSourcePrefixes = [
  "frontend/src/app/[locale]/",
  "frontend/src/components/shell/",
  "frontend/src/components/ui/",
  "frontend/src/features/",
  "frontend/src/lib/api/",
  "frontend/src/lib/navigation/",
  "frontend/src/lib/public-site/",
];
const designMockupGenerator = "scripts/design/generate-frontend-mockups.mjs";
const designMockupReadme = "docs/frontend-design/README.md";
const designMockupRoot = "docs/frontend-design/pages";
const designMockupPages = [
  "home",
  "search",
  "pages-list",
  "page-detail",
  "news-list",
  "news-detail",
  "documents-list",
  "documents-detail",
  "events-list",
  "events-detail",
  "departments-list",
  "department-detail",
  "staff-list",
  "staff-detail",
  "officials-list",
  "official-detail",
  "committees-list",
  "committee-detail",
];
const designMockupViewports = {
  desktop: 1440,
  mobile: 390,
};

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

function hasDependency(parsed, dependency) {
  return Boolean(
    parsed.dependencies?.[dependency] || parsed.devDependencies?.[dependency],
  );
}

function hasRuntimeDependency(parsed, dependency) {
  return Boolean(parsed.dependencies?.[dependency]);
}

function hasDevDependency(parsed, dependency) {
  return Boolean(parsed.devDependencies?.[dependency]);
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
  const requiredScripts = [
    "guardrails",
    "verify",
    "verify:backend",
    "verify:frontend",
    "design:mockups",
  ];
  for (const scriptName of requiredScripts) {
    if (!scripts[scriptName]) {
      fail.push(`Root package.json missing script "${scriptName}".`);
    }
  }

  for (const [scriptName, script] of Object.entries(scripts)) {
    if (
      [
        "guardrails",
        "verify",
        "verify:backend",
        "verify:frontend",
        "design:mockups",
      ].includes(
        scriptName,
      ) &&
      scriptContainsBlockedCommand(script)
    ) {
      fail.push(
        `Root routine script "${scriptName}" must not run dev/build/start/Docker commands.`,
      );
    }

    if (
      scriptName === "design:mockups" &&
      scriptContainsBrowserTest(script)
    ) {
      fail.push(
        'Root script "design:mockups" must stay static and must not run browser/Playwright-style checks.',
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
  for (const dependency of forbiddenUiDependencies) {
    if (hasDependency(parsed, dependency)) {
      fail.push(
        `Frontend public UI must use the project-owned design system; external UI dependency is not allowed: ${dependency}`,
      );
    }
  }

  for (const dependency of forbiddenLocalizationDependencies) {
    if (hasDependency(parsed, dependency)) {
      fail.push(
        `Frontend UI localization must use Paraglide, not deprecated dependency: ${dependency}`,
      );
    }
  }

  for (const dependency of requiredAdminUiDependencies) {
    if (!hasRuntimeDependency(parsed, dependency)) {
      fail.push(
        `Admin dashboard foundation requires scoped Mantine dependency: ${dependency}`,
      );
    }
  }

  const requiredScripts = [
    "dev",
    "build",
    "start",
    "guardrails",
    "verify",
    "lint-ci",
    "type-check",
    "test",
    "test:watch",
    "test:coverage",
    "i18n:compile",
  ];
  for (const scriptName of requiredScripts) {
    if (!scripts[scriptName]) {
      fail.push(`frontend/package.json missing script "${scriptName}".`);
    }
  }

  const lifecycleScripts = {
    dev: { pattern: /^next\s+dev$/, command: "next dev" },
    build: { pattern: /^next\s+build$/, command: "next build" },
    start: { pattern: /^next\s+start$/, command: "next start" },
  };
  for (const [scriptName, expected] of Object.entries(lifecycleScripts)) {
    if (
      scripts[scriptName] &&
      !expected.pattern.test(scripts[scriptName].trim())
    ) {
      fail.push(
        `frontend script "${scriptName}" must be "${expected.command}".`,
      );
    }
  }

  const requiredTestDeps = [
    "vitest",
    "@testing-library/react",
    "@testing-library/jest-dom",
    "@testing-library/user-event",
    "jsdom",
    "msw",
    "@vitest/coverage-v8",
  ];
  for (const dependency of requiredTestDeps) {
    if (!hasDependency(parsed, dependency)) {
      fail.push(`frontend/package.json missing frontend test dependency: ${dependency}`);
    }
  }

  const requiredRuntimeDeps = [
    "lucide-react",
    "@tanstack/react-query",
    "zod",
    "@t3-oss/env-nextjs",
    "react-hook-form",
    "@hookform/resolvers",
    "clsx",
    "sanitize-html",
    "date-fns",
    "sharp",
    "@tiptap/react",
    "@tiptap/pm",
    "@tiptap/starter-kit",
    "@tiptap/extension-link",
    "@tiptap/extension-underline",
  ];
  for (const dependency of requiredRuntimeDeps) {
    if (!hasRuntimeDependency(parsed, dependency)) {
      fail.push(
        `frontend/package.json missing required runtime dependency: ${dependency}`,
      );
    }
  }

  const requiredDevDeps = [
    "@inlang/paraglide-js",
    "@inlang/plugin-message-format",
    "tailwindcss",
    "@tailwindcss/postcss",
    "postcss",
    "@types/sanitize-html",
    "@tanstack/react-query-devtools",
  ];
  for (const dependency of requiredDevDeps) {
    if (!hasDevDependency(parsed, dependency)) {
      fail.push(
        `frontend/package.json missing required dev dependency: ${dependency}`,
      );
    }
  }

  if (scripts.test && !/\bvitest\s+run\b/.test(scripts.test)) {
    fail.push('frontend script "test" must run "vitest run".');
  }

  if (
    scripts["i18n:compile"] &&
    !/paraglide-js\s+compile/.test(scripts["i18n:compile"])
  ) {
    fail.push('frontend script "i18n:compile" must run Paraglide compile.');
  }

  if (scripts["test:watch"] && !/\bvitest\b/.test(scripts["test:watch"])) {
    fail.push('frontend script "test:watch" must run Vitest watch mode.');
  }

  if (
    scripts["test:coverage"] &&
    (!/\bvitest\s+run\b/.test(scripts["test:coverage"]) ||
      !/--coverage/.test(scripts["test:coverage"]))
  ) {
    fail.push('frontend script "test:coverage" must run Vitest with coverage.');
  }

  if (
    scripts.verify &&
    (!/npm\s+run\s+guardrails/.test(scripts.verify) ||
      !/npm\s+run\s+lint-ci/.test(scripts.verify) ||
      !/npm\s+test/.test(scripts.verify))
  ) {
    fail.push(
      'frontend script "verify" must include guardrails, lint-ci, and npm test.',
    );
  }

  for (const [scriptName, script] of Object.entries(scripts)) {
    if (
      ["guardrails", "verify", "lint-ci", "type-check", "test", "i18n:compile"].includes(
        scriptName,
      ) &&
      scriptContainsBlockedCommand(script)
    ) {
      fail.push(
        `Frontend routine script "${scriptName}" must not run dev/build/start/Docker commands.`,
      );
    }

    if (
      ["guardrails", "verify", "lint-ci", "type-check", "test", "i18n:compile"].includes(
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

function paraglideLocalizationChecks() {
  if (!existsSync(frontendRoot)) return;

  const requiredFiles = [
    "frontend/project.inlang/settings.json",
    "frontend/messages/en.json",
    "frontend/messages/bg.json",
    "frontend/src/lib/i18n/messages.ts",
    "frontend/src/lib/i18n/messages.spec.ts",
    "frontend/src/lib/i18n/paraglide/messages.js",
    "frontend/src/lib/i18n/paraglide/messages.d.ts",
    "frontend/src/lib/i18n/paraglide/runtime.js",
    "frontend/src/lib/i18n/paraglide/runtime.d.ts",
  ];

  for (const file of requiredFiles) {
    if (!existsSync(path.join(root, file))) {
      fail.push(`Paraglide frontend localization requires ${file}.`);
    }
  }

  const settingsPath = path.join(frontendRoot, "project.inlang", "settings.json");
  const settings = existsSync(settingsPath)
    ? parseJson(settingsPath, "frontend/project.inlang/settings.json")
    : undefined;
  if (settings) {
    if (settings.baseLocale !== "en") {
      fail.push("Paraglide baseLocale must stay en.");
    }
    if (JSON.stringify(settings.locales) !== JSON.stringify(["en", "bg"])) {
      fail.push('Paraglide locales must stay exactly ["en", "bg"].');
    }
    const modules = Array.isArray(settings.modules) ? settings.modules.join("\n") : "";
    if (!modules.includes("@inlang/plugin-message-format")) {
      fail.push("Paraglide settings must use @inlang/plugin-message-format.");
    }
  }

  for (const locale of ["en", "bg"]) {
    const file = path.join(frontendRoot, "messages", `${locale}.json`);
    const messages = existsSync(file)
      ? parseJson(file, `frontend/messages/${locale}.json`)
      : undefined;
    if (messages && Object.keys(messages).length === 0) {
      fail.push(`frontend/messages/${locale}.json must not be empty.`);
    }
  }

  const messageFacade = path.join(srcRoot, "lib", "i18n", "messages.ts");
  if (existsSync(messageFacade)) {
    const text = read(messageFacade);
    for (const token of [
      "./paraglide/messages.js",
      "getAdminCopy",
      "getPublicNavigationCopy",
      "getPublicNotFoundCopy",
      "getPublicSiteFallbackCopy",
      "getPublicShellCopy",
    ]) {
      if (!text.includes(token)) {
        fail.push(`Frontend i18n message facade must include ${token}.`);
      }
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

function adminDashboardChecks() {
  if (!existsSync(frontendRoot)) return;

  const requiredFiles = [
    "frontend/src/app/admin/layout.tsx",
    "frontend/src/app/admin/page.tsx",
    "frontend/src/app/admin/login/page.tsx",
    "frontend/src/app/[locale]/admin/layout.tsx",
    "frontend/src/app/[locale]/admin/login/page.tsx",
    "frontend/src/app/[locale]/admin/(protected)/layout.tsx",
    "frontend/src/app/[locale]/admin/(protected)/page.tsx",
    "frontend/src/app/[locale]/admin/(protected)/not-found.tsx",
    "frontend/src/app/[locale]/admin/(protected)/[...adminNotFound]/page.tsx",
    "frontend/src/app/admin/api/[...adminApiNotFound]/route.ts",
    "frontend/src/app/[locale]/admin/(protected)/news/page.tsx",
    "frontend/src/app/[locale]/admin/(protected)/news/new/page.tsx",
    "frontend/src/app/[locale]/admin/(protected)/news/[id]/page.tsx",
    "frontend/src/components/admin/admin-not-found-boundary.tsx",
    "frontend/src/components/admin/admin-providers.tsx",
    "frontend/src/components/admin/admin-login-form.tsx",
    "frontend/src/components/admin/admin-not-found-content.tsx",
    "frontend/src/components/admin/admin-shell.tsx",
    "frontend/src/lib/admin-api/admin-fetch.ts",
    "frontend/src/lib/admin-api/auth.ts",
    "frontend/src/lib/admin-api/news-client.ts",
    "frontend/src/lib/admin-auth/server.ts",
    "frontend/src/lib/admin-auth/session.ts",
    "frontend/src/lib/admin-auth/client.ts",
    "frontend/src/lib/i18n/messages.ts",
    "frontend/src/features/admin-news/admin-news-queries.ts",
  ];

  for (const file of requiredFiles) {
    if (!existsSync(path.join(root, file))) {
      fail.push(`Admin dashboard foundation requires ${file}.`);
    }
  }

  const adminLayout = path.join(srcRoot, "app", "admin", "layout.tsx");
  if (existsSync(adminLayout)) {
    const text = read(adminLayout);
    for (const importName of [
      "@mantine/core/styles.css",
      "@mantine/dropzone/styles.css",
      "@mantine/notifications/styles.css",
      "@mantine/tiptap/styles.css",
      "AdminProviders",
    ]) {
      if (!text.includes(importName)) {
        fail.push(`Admin layout must include ${importName}.`);
      }
    }
  }

  const localizedAdminLayout = path.join(
    srcRoot,
    "app",
    "[locale]",
    "admin",
    "layout.tsx",
  );
  if (existsSync(localizedAdminLayout)) {
    const text = read(localizedAdminLayout);
    for (const importName of [
      "@mantine/core/styles.css",
      "@mantine/dropzone/styles.css",
      "@mantine/notifications/styles.css",
      "@mantine/tiptap/styles.css",
      "AdminProviders",
    ]) {
      if (!text.includes(importName)) {
        fail.push(`Localized admin layout must include ${importName}.`);
      }
    }
  }

  const adminLoginPage = path.join(
    srcRoot,
    "app",
    "[locale]",
    "admin",
    "login",
    "page.tsx",
  );
  if (existsSync(adminLoginPage)) {
    const text = read(adminLoginPage);
    for (const token of [
      "getCurrentAdminAccount",
      "redirect",
      "getAdminDashboardPath",
      "AdminLoginForm",
      "resolveRouteLocale",
    ]) {
      if (!text.includes(token)) {
        fail.push(`Localized admin login page must use ${token}.`);
      }
    }
  }

  const protectedLayout = path.join(
    srcRoot,
    "app",
    "[locale]",
    "admin",
    "(protected)",
    "layout.tsx",
  );
  if (existsSync(protectedLayout)) {
    const text = read(protectedLayout);
    for (const token of [
      "getCurrentAdminAccount",
      "redirect",
      "getAdminLoginPath",
      "AdminShell",
      "requireLocale",
    ]) {
      if (!text.includes(token)) {
        fail.push(`Localized protected admin layout must use ${token}.`);
      }
    }
  }

  const adminNotFound = path.join(
    srcRoot,
    "app",
    "[locale]",
    "admin",
    "(protected)",
    "not-found.tsx",
  );
  if (existsSync(adminNotFound)) {
    const text = read(adminNotFound);
    if (!text.includes("AdminNotFoundBoundary")) {
      fail.push("Protected admin not-found route must render AdminNotFoundBoundary.");
    }
  }

  const unknownAdminPage = path.join(
    srcRoot,
    "app",
    "[locale]",
    "admin",
    "(protected)",
    "[...adminNotFound]",
    "page.tsx",
  );
  if (existsSync(unknownAdminPage)) {
    const text = read(unknownAdminPage);
    if (!text.includes("notFound")) {
      fail.push("Unknown protected admin pages must call notFound().");
    }
  }

  const unknownAdminApi = path.join(
    srcRoot,
    "app",
    "admin",
    "api",
    "[...adminApiNotFound]",
    "route.ts",
  );
  if (existsSync(unknownAdminApi)) {
    const text = read(unknownAdminApi);
    if (!text.includes("NextResponse.json") || !text.includes("status: 404")) {
      fail.push("Unknown admin API routes must return a JSON 404 response.");
    }
  }

  const adminApi = path.join(srcRoot, "lib", "admin-api", "auth.ts");
  if (existsSync(adminApi)) {
    const text = read(adminApi);
    if (
      !text.includes("/admin/auth/login") ||
      !text.includes("credentials: 'include'") ||
      !text.includes("readBackendAdminSessionFromCookieHeader")
    ) {
      fail.push(
        "Admin auth wrapper must use backend-owned cookie auth with credentialed backend session calls.",
      );
    }
  }

  const adminFetchWrapper = path.join(
    srcRoot,
    "lib",
    "admin-api",
    "admin-fetch.ts",
  );
  if (existsSync(adminFetchWrapper)) {
    const text = read(adminFetchWrapper);
    for (const token of [
      "getPublicApiBaseUrl",
      "credentials: 'include'",
      "townhall_admin_csrf",
      "x-townhall-csrf",
      "document.cookie",
    ]) {
      if (!text.includes(token)) {
        fail.push(`Admin backend cookie fetch wrapper must include ${token}.`);
      }
    }
  }

  const newsClient = path.join(srcRoot, "lib", "admin-api", "news-client.ts");
  if (existsSync(newsClient)) {
    const text = read(newsClient);
    if (!text.includes("adminFetchJson") || !text.includes("/admin/news")) {
      fail.push(
        "News admin browser client must call backend admin routes through the admin fetch wrapper.",
      );
    }
    if (text.includes("/admin/api/news")) {
      fail.push("News admin browser client must not call Next /admin/api/news proxies.");
    }
  }

  const adminSession = path.join(srcRoot, "lib", "admin-auth", "session.ts");
  if (existsSync(adminSession)) {
    const text = read(adminSession);
    for (const token of [
      "townhall_admin_session",
      "townhall_admin_csrf",
      "getAdminDashboardPath",
      "getAdminLoginPath",
      "switchAdminLocalePath",
    ]) {
      if (!text.includes(token)) {
        fail.push(`Admin session cookie policy must include ${token}.`);
      }
    }
  }

  const localizedAdminComponents = [
    "frontend/src/components/admin/admin-shell.tsx",
    "frontend/src/components/admin/admin-login-form.tsx",
    "frontend/src/components/admin/admin-dashboard-home.tsx",
    "frontend/src/components/admin/admin-not-found-content.tsx",
  ];
  for (const file of localizedAdminComponents) {
    const absolute = path.join(root, file);
    if (!existsSync(absolute)) continue;
    const text = read(absolute);
    if (!text.includes("SupportedLocale") || !text.includes("getAdminCopy")) {
      fail.push(`Localized admin component must use SupportedLocale and admin copy: ${file}.`);
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

    if (
      !isGenerated &&
      /\/admin\//.test(text) &&
      !adminSourcePrefixes.some((prefix) => relative.startsWith(prefix))
    ) {
      fail.push(`Public frontend code must not call admin APIs: ${relative}`);
    }

    if (
      !isGenerated &&
      publicSourcePrefixes.some((prefix) => relative.startsWith(prefix)) &&
      !adminSourcePrefixes.some((prefix) => relative.startsWith(prefix)) &&
      /@\/(?:components\/admin|lib\/admin-api|lib\/admin-auth)/.test(text)
    ) {
      fail.push(
        `Public frontend code must not import admin dashboard modules: ${relative}`,
      );
    }

    if (
      !isGenerated &&
      !relative.startsWith("frontend/src/lib/admin-api/") &&
      /@\/lib\/api\/generated/.test(text) &&
      /\b(?:admin\w*Controller|Admin\w*Controller)/.test(text)
    ) {
      fail.push(
        `Generated admin SDK functions must be wrapped under frontend/src/lib/admin-api: ${relative}`,
      );
    }

    if (!isGenerated && /\bfetch\s*\(/.test(text) && !isApiWrapper) {
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
    if (isGenerated(relative)) continue;

    const text = read(file);

    if (/\b(localStorage|sessionStorage)\b/.test(text)) {
      fail.push(
        `Do not store or read auth state from browser storage: ${relative}`,
      );
    }

    if (
      /document\.cookie/.test(text) &&
      !relative.startsWith("frontend/src/server/") &&
      !relative.startsWith("frontend/src/lib/auth/") &&
      relative !== "frontend/src/lib/admin-api/admin-fetch.ts"
    ) {
      fail.push(
        `Do not manage auth cookies outside the approved admin fetch wrapper: ${relative}`,
      );
    }

    if (
      /\/admin\/api\/(?:auth|news)\b/.test(text) &&
      !relative.startsWith("frontend/src/app/admin/api/[...adminApiNotFound]/")
    ) {
      fail.push(
        `Admin auth/news browser calls must target the backend, not Next admin API proxies: ${relative}`,
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

function shellNavigationChecks() {
  if (!existsSync(frontendRoot)) return;

  const navigationSource = path.join(
    srcRoot,
    "lib",
    "navigation",
    "public-navigation.ts",
  );
  if (!existsSync(navigationSource)) {
    fail.push(
      "Frontend shell navigation must be owned by frontend/src/lib/navigation/public-navigation.ts.",
    );
    return;
  }

  const navigationText = read(navigationSource);
  for (const exportName of [
    "getFrontendHeaderNavigation",
    "getFrontendFooterNavigation",
  ]) {
    if (!navigationText.includes(exportName)) {
      fail.push(
        `Frontend shell navigation source must export ${exportName}.`,
      );
    }
  }

  const publicShellApi = path.join(srcRoot, "lib", "api", "public-shell.ts");
  if (!existsSync(publicShellApi)) return;

  const publicShellText = read(publicShellApi);
  if (
    !publicShellText.includes("getFrontendHeaderNavigation") ||
    !publicShellText.includes("getFrontendFooterNavigation")
  ) {
    fail.push(
      "Public shell data must use frontend-owned header/footer navigation.",
    );
  }

  if (
    /getPublicNavigation\(\s*locale\s*,\s*['"](?:header|footer)['"]\s*\)/.test(
      publicShellText,
    )
  ) {
    fail.push(
      "Public shell header/footer navigation must not depend on backend navigation endpoints.",
    );
  }
}

function projectDesignSystemChecks() {
  if (!existsSync(frontendRoot)) return;

  const dsfrRoot = path.join(srcRoot, "components", "dsfr");
  if (existsSync(dsfrRoot) && walk(dsfrRoot).length > 0) {
    fail.push(
      "Frontend must use project-owned UI components under frontend/src/components/ui, not frontend/src/components/dsfr.",
    );
  }

  if (!existsSync(path.join(srcRoot, "components", "ui"))) {
    fail.push("Frontend custom design-system components must live under frontend/src/components/ui.");
  }

  if (!existsSync(path.join(srcRoot, "components", "admin"))) {
    fail.push("Admin dashboard components must live under frontend/src/components/admin.");
  }

  const files = walk(frontendRoot).filter((file) =>
    /\.(ts|tsx|js|jsx|css|scss)$/.test(file),
  );

  for (const file of files) {
    const relative = rel(file);
    if (isGenerated(relative)) continue;

    const text = read(file);

    if (forbiddenUiImportPattern.test(text)) {
      fail.push(
        `Frontend source must not import banned external UI/component libraries: ${relative}`,
      );
    }

    if (
      mantineImportPattern.test(text) &&
      !relative.startsWith("frontend/src/app/admin/") &&
      !relative.startsWith("frontend/src/app/[locale]/admin/") &&
      !relative.startsWith("frontend/src/components/admin/") &&
      !relative.startsWith("frontend/src/features/admin-news/")
    ) {
      fail.push(
        `Mantine imports are allowed only in admin route/component files: ${relative}`,
      );
    }

    if (
      tiptapImportPattern.test(text) &&
      !relative.startsWith("frontend/src/features/admin-news/")
    ) {
      fail.push(
        `Tiptap imports are allowed only in the News admin feature: ${relative}`,
      );
    }

    if (
      mantineImportPattern.test(text) &&
      /component=\{Link\}/.test(text) &&
      !/^['"]use client['"];?/.test(text.trimStart())
    ) {
      fail.push(
        `Mantine components that receive Next Link through component={Link} must be client components: ${relative}`,
      );
    }

    const hasDsfrClass =
      /\.(css|scss)$/.test(relative)
        ? /\.fr-[\w-]+/.test(text)
        : /['"`][^'"`]*\bfr-[\w-]+/.test(text);
    if (hasDsfrClass) {
      fail.push(
        `Frontend source must not use DSFR fr-* classes; use townhall-* classes: ${relative}`,
      );
    }
  }
}

function themeChecks() {
  if (!existsSync(frontendRoot)) return;

  const themePath = path.join(root, themeFile);
  if (!existsSync(themePath)) {
    fail.push("Frontend civic theme file is required: frontend/src/styles/townhall-theme.css");
    return;
  }

  const themeText = read(themePath);
  const requiredThemeTokens = [
    "--color-townhall-navy:",
    "--color-townhall-deep:",
    "--color-townhall-gold:",
    "--color-townhall-cream:",
    "--color-townhall-paper:",
    "--color-townhall-panel:",
    "--color-townhall-slate:",
    "--color-townhall-muted:",
    "--color-townhall-border:",
    "--color-townhall-border-light:",
    "--color-townhall-footer-line:",
    "--townhall-color-background:",
    "--townhall-color-surface:",
    "--townhall-color-primary:",
    "--townhall-color-accent:",
    "--townhall-focus-ring:",
  ];
  for (const token of requiredThemeTokens) {
    if (!themeText.includes(token)) {
      fail.push(`Frontend theme must define required civic token: ${token}`);
    }
  }

  if (!/@theme\s*\{/.test(themeText)) {
    fail.push("Frontend theme must expose Tailwind v4 tokens through an @theme block.");
  }

  const globalsPath = path.join(srcRoot, "styles", "globals.css");
  if (!existsSync(globalsPath)) {
    fail.push("Frontend globals CSS file is required: frontend/src/styles/globals.css");
  } else {
    const globalsText = read(globalsPath);
    const tailwindImport = globalsText.indexOf('@import "tailwindcss"');
    const themeImport = globalsText.indexOf('@import "./townhall-theme.css"');

    if (tailwindImport === -1) {
      fail.push("Frontend globals.css must import Tailwind CSS.");
    }
    if (themeImport === -1) {
      fail.push("Frontend globals.css must import townhall-theme.css after Tailwind.");
    } else if (tailwindImport !== -1 && themeImport < tailwindImport) {
      fail.push("Frontend globals.css must import townhall-theme.css after Tailwind.");
    }
  }

  const postcssPath = path.join(frontendRoot, "postcss.config.mjs");
  if (!existsSync(postcssPath)) {
    fail.push("Frontend Tailwind v4 setup requires frontend/postcss.config.mjs.");
  } else if (!read(postcssPath).includes("@tailwindcss/postcss")) {
    fail.push("Frontend postcss.config.mjs must use @tailwindcss/postcss.");
  }

  const rootLayout = path.join(srcRoot, "app", "layout.tsx");
  if (existsSync(rootLayout)) {
    const layoutText = read(rootLayout);
    if (!layoutText.includes("@/styles/globals.css")) {
      fail.push("Root layout must import frontend global CSS.");
    }
  }

  const files = walk(srcRoot).filter((file) =>
    /\.(ts|tsx|js|jsx|css|scss)$/.test(file),
  );
  const hexColorPattern = /(^|[^A-Za-z0-9_])#[0-9a-fA-F]{3,8}\b/g;
  const inlineColorPattern =
    /style\s*=\s*\{\{[^}]*\b(color|background|backgroundColor|borderColor|boxShadow)\b/;

  for (const file of files) {
    const relative = rel(file);
    if (isGenerated(relative)) continue;

    const text = read(file);
    const hasHexColor = hexColorPattern.test(text);
    hexColorPattern.lastIndex = 0;
    if (hasHexColor && !approvedColorFiles.has(relative)) {
      fail.push(
        `Frontend hardcoded colors must live in the approved theme file, not ${relative}`,
      );
    }

    if (/\.(ts|tsx|js|jsx)$/.test(relative) && inlineColorPattern.test(text)) {
      fail.push(
        `Frontend inline color styles must use theme classes or CSS tokens, not ${relative}`,
      );
    }

    if (
      /\.(ts|tsx|js|jsx)$/.test(relative) &&
      /(?:bg|text|border|ring|shadow)-\[[^\]]*#[^\]]*\]/.test(text)
    ) {
      fail.push(
        `Frontend Tailwind arbitrary hex color utilities are not allowed outside theme tokens: ${relative}`,
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
  ];

  for (const file of files) {
    const relative = rel(file);
    if (isGenerated(relative)) continue;

    if (relative.includes("/tests/") || isSpecFile(relative)) {
      continue;
    }

    const text = read(file);
    if (/[\u0400-\u04FF]/.test(text)) {
      fail.push(
        `Frontend Bulgarian UI strings must live in frontend/messages/bg.json or generated Paraglide output, not ${relative}`,
      );
    }

    const found = suspiciousContent.filter((term) => text.includes(term));
    if (found.length > 0) {
      warn.push(
        `Frontend may contain hardcoded municipality content; content should come from public APIs: ${relative} (${found.join(", ")})`,
      );
    }
  }
}

function designMockupChecks() {
  if (!existsSync(frontendRoot)) return;

  const generatorPath = path.join(root, designMockupGenerator);
  if (!existsSync(generatorPath)) {
    fail.push(`Frontend design mockup generator is required: ${designMockupGenerator}`);
  } else {
    const generatorText = read(generatorPath);
    if (scriptContainsBlockedCommand(generatorText) || scriptContainsBrowserTest(generatorText)) {
      fail.push(
        "Frontend design mockup generator must stay static and must not run dev/build/start/Docker/browser commands.",
      );
    }
    if (forbiddenUiImportPattern.test(generatorText) || /\bfr-[\w-]+/.test(generatorText)) {
      fail.push(
        "Frontend design mockup generator must reflect the project-owned design system, not DSFR/UI-library classes.",
      );
    }
  }

  if (!existsSync(path.join(root, designMockupReadme))) {
    fail.push(`Frontend design mockup README is required: ${designMockupReadme}`);
  }

  const pagesRoot = path.join(root, designMockupRoot);
  if (!existsSync(pagesRoot)) {
    fail.push(`Frontend design mockup pages folder is required: ${designMockupRoot}`);
    return;
  }

  const pngFiles = walk(pagesRoot).filter((file) => file.endsWith(".png"));
  const expectedPngCount =
    designMockupPages.length * Object.keys(designMockupViewports).length;
  if (pngFiles.length !== expectedPngCount) {
    fail.push(
      `Frontend design mockups must contain exactly ${expectedPngCount} PNG files; found ${pngFiles.length}.`,
    );
  }

  for (const page of designMockupPages) {
    for (const [viewport, expectedWidth] of Object.entries(designMockupViewports)) {
      const file = path.join(pagesRoot, page, `${viewport}.png`);
      if (!existsSync(file)) {
        fail.push(`Missing frontend design mockup: ${rel(file)}`);
        continue;
      }

      const size = readPngSize(file);
      if (!size) {
        fail.push(`Frontend design mockup must be a valid PNG: ${rel(file)}`);
        continue;
      }

      if (size.width !== expectedWidth) {
        fail.push(
          `Frontend design mockup ${rel(file)} must be ${expectedWidth}px wide, not ${size.width}px.`,
        );
      }

      if (size.height < 1) {
        fail.push(`Frontend design mockup has invalid height: ${rel(file)}`);
      }
    }
  }
}

function readPngSize(file) {
  const buffer = readFileSync(file);
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a" || buffer.length < 24) return null;

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function isGenerated(relative) {
  return generatedRoots.some((prefix) => relative.startsWith(prefix));
}

function isSpecFile(relative) {
  return /\.(spec|test)\.(ts|tsx|js|jsx)$/.test(relative);
}

function isIndexBarrel(file, text) {
  if (!/^index\.(ts|tsx|js|jsx)$/.test(path.basename(file))) return false;
  const stripped = text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .trim();
  return stripped
    .split("\n")
    .filter(Boolean)
    .every((line) => /^export\s/.test(line.trim()));
}

function isPureTypeFile(relative, text) {
  if (/\.d\.ts$/.test(relative)) return true;
  if (!/\.(types|type)\.ts$/.test(relative)) return false;

  const stripped = text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .trim();
  return !/\b(const|let|var|function|class|enum|return|=>)\b/.test(stripped);
}

function hasColocatedSpec(file) {
  const dir = path.dirname(file);
  const ext = path.extname(file);
  const base = path.basename(file, ext);
  const candidates = [
    `${base}.spec.ts`,
    `${base}.spec.tsx`,
    `${base}.test.ts`,
    `${base}.test.tsx`,
  ].map((candidate) => path.join(dir, candidate));

  return candidates.some((candidate) => existsSync(candidate));
}

function testCoverageChecks() {
  if (!existsSync(frontendRoot)) return;

  const sourceRoots = [
    "frontend/src/features/",
    "frontend/src/components/",
    "frontend/src/lib/",
    "frontend/src/app/admin/",
    "frontend/src/app/[locale]/",
  ];
  const files = walk(srcRoot).filter((file) => /\.(ts|tsx)$/.test(file));

  for (const file of files) {
    const relative = rel(file);
    const text = read(file);

    if (!sourceRoots.some((prefix) => relative.startsWith(prefix))) continue;
    if (isGenerated(relative)) continue;
    if (isSpecFile(relative)) continue;
    if (/\.d\.ts$/.test(relative)) continue;
    if (/\/(__tests__|test|tests)\//.test(relative)) continue;
    if (/\.(css|scss)$/.test(relative)) continue;
    if (isIndexBarrel(file, text)) continue;
    if (isPureTypeFile(relative, text)) continue;

    if (!hasColocatedSpec(file)) {
      fail.push(
        `Frontend source needs colocated Vitest coverage: ${relative}`,
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
paraglideLocalizationChecks();
appRouterChecks();
adminDashboardChecks();
sourcePlacementChecks();
generatedApiChecks();
clientSecurityChecks();
shellNavigationChecks();
projectDesignSystemChecks();
themeChecks();
contentHardcodingChecks();
designMockupChecks();
testCoverageChecks();
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
