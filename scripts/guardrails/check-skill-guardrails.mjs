#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const args = new Set(process.argv.slice(2));
const hookMode = args.has("--hook");
const fail = [];
const warn = [];

function runGit(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function findRepoRoot() {
  return runGit(["rev-parse", "--show-toplevel"]) || process.cwd();
}

const root = findRepoRoot();

function read(file) {
  return readFileSync(file, "utf8");
}

function parseJson(file, label) {
  try {
    return JSON.parse(read(file));
  } catch {
    fail.push(`${label} must be valid JSON.`);
    return undefined;
  }
}

const manifestFile = path.join(root, ".codex", "project-skills.json");
const routingDocFile = path.join(root, "docs", "codex-skill-routing.md");
const packageFile = path.join(root, "package.json");
const hookRunnerFile = path.join(root, ".codex", "hooks", "project-guardrails.mjs");
const installerFile = path.join(root, "scripts", "skills", "install-project-skills.mjs");
const vendoredSkillDir = path.join(root, "tools", "codex-skills");

if (!existsSync(manifestFile)) fail.push("Missing .codex/project-skills.json.");
if (!existsSync(installerFile)) fail.push("Missing scripts/skills/install-project-skills.mjs.");
if (existsSync(vendoredSkillDir)) {
  fail.push("Manifest-only skill policy forbids vendored skill folders under tools/codex-skills.");
}

const manifest = existsSync(manifestFile)
  ? parseJson(manifestFile, ".codex/project-skills.json")
  : undefined;
const packageJson = existsSync(packageFile)
  ? parseJson(packageFile, "Root package.json")
  : undefined;
const routingDoc = existsSync(routingDocFile) ? read(routingDocFile) : "";

if (manifest) {
  const names = new Set();
  const duplicateNames = new Set();

  for (const skill of manifest.skills ?? []) {
    if (!skill.name) {
      fail.push("Every project skill manifest entry needs a name.");
      continue;
    }

    if (names.has(skill.name)) duplicateNames.add(skill.name);
    names.add(skill.name);

    if (!skill.source) {
      fail.push(`Project skill missing source: ${skill.name}`);
    }

    if (!skill.installCommand) {
      fail.push(`Project skill missing installCommand: ${skill.name}`);
    }

    if (!routingDoc.includes(`\`${skill.name}\``)) {
      fail.push(`docs/codex-skill-routing.md does not mention project skill: ${skill.name}`);
    }
  }

  for (const name of duplicateNames) {
    fail.push(`Duplicate project skill manifest entry: ${name}`);
  }

  const installedSection = routingDoc.match(
    /## Installed Skills([\s\S]*?)## When To Use Skills/,
  )?.[1] ?? "";
  const docSkillNames = [...installedSection.matchAll(/^- `([^`]+)` from /gm)]
    .map((match) => match[1])
    .filter((name) => !name.includes("/"));

  for (const name of docSkillNames) {
    if (!names.has(name)) {
      fail.push(`docs/codex-skill-routing.md lists skill missing from manifest: ${name}`);
    }
  }
}

if (packageJson) {
  const guardrails = packageJson.scripts?.guardrails ?? "";
  if (!guardrails.includes("check-skill-guardrails.mjs")) {
    fail.push('Root package.json script "guardrails" must run skill guardrails.');
  }
}

if (existsSync(hookRunnerFile)) {
  const hookRunner = read(hookRunnerFile);
  if (!hookRunner.includes("check-skill-guardrails.mjs")) {
    fail.push("Codex project guardrail hook runner must include skill guardrails.");
  }
}

for (const message of warn) {
  console.warn(`skill guardrail warning: ${message}`);
}

if (fail.length > 0) {
  console.error("\nSkill guardrails failed:");
  for (const message of fail) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

const suffix = hookMode ? " (hook)" : "";
console.log(`Skill guardrails passed${suffix}.`);
