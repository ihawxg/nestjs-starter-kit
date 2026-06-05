#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const install = args.has("--install");
const verify = args.has("--verify");

function usage() {
  console.log([
    "Usage: node scripts/skills/install-project-skills.mjs --dry-run|--install|--verify",
    "",
    "--dry-run  Print restore actions without mutating local skill directories.",
    "--install  Install missing skills from upstream sources listed in .codex/project-skills.json.",
    "--verify   Verify local installed skill directories exist.",
  ].join("\n"));
}

if (![dryRun, install, verify].some(Boolean)) {
  usage();
  process.exit(1);
}

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

function repoRoot() {
  return runGit(["rev-parse", "--show-toplevel"]) || process.cwd();
}

const root = repoRoot();
const manifestPath = path.join(root, ".codex", "project-skills.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const home = os.homedir();

function expandTarget(target) {
  if (target.startsWith("$HOME/")) {
    return path.join(home, target.slice("$HOME/".length));
  }
  return path.resolve(root, target);
}

function installedTargets(skill) {
  return (skill.installTargets ?? []).map(expandTarget);
}

function hasSkillFile(dir) {
  return existsSync(path.join(dir, "SKILL.md"));
}

function isInstalled(skill) {
  return installedTargets(skill).some(hasSkillFile);
}

function runInstallCommand(skill) {
  const command = skill.installCommand;
  if (!command) return false;

  const result = spawnSync(command, {
    cwd: root,
    shell: true,
    stdio: "inherit",
    env: { ...process.env, HOME: home },
  });
  return (result.status ?? 1) === 0;
}

function printDryRun() {
  for (const skill of manifest.skills) {
    console.log(`${skill.name}: ${skill.installCommand}`);
  }
}

function verifyAll() {
  const errors = [];

  for (const skill of manifest.skills) {
    if (!isInstalled(skill)) {
      errors.push(
        `Local installed skill missing for ${skill.name}: ${(skill.installTargets ?? []).join(", ")}`,
      );
    }
  }

  if (errors.length > 0) {
    console.error("Project skill verification failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Project skills verified: ${manifest.skills.length} installed skills.`);
}

function installAll() {
  for (const skill of manifest.skills) {
    if (isInstalled(skill)) {
      console.log(`${skill.name}: already installed`);
      continue;
    }

    console.log(`${skill.name}: installing from source`);
    if (!runInstallCommand(skill)) {
      throw new Error(`Install command failed for ${skill.name}`);
    }
  }

  console.log("Project skill install complete. Restart Codex to pick up new skills.");
}

if (dryRun) printDryRun();
if (verify) verifyAll();
if (install) installAll();
