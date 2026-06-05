# Hook Context Policy

## Purpose

Hooks are enforcement and reminder tools. They do not replace `AGENTS.md`, project docs, or reading relevant context before editing.

## Context Loading Contract

- `AGENTS.md` is the always-loaded project contract.
- Docs under `docs/` hold durable standards by topic.
- Hooks print concise reminders and run checks.
- Hooks should not dump every docs file into every turn.

## Current Hooks

- `SessionStart`: prints a short project context summary.
- `UserPromptSubmit`: suggests relevant docs based on prompt keywords.
- `PreToolUse` for Bash: blocks routine build/dev/start/Docker/browser-test commands.
- `PreToolUse` for edits: runs backend, frontend, and skill guardrails before file edits.
- `PostToolUse` for edits: runs backend, frontend, and skill guardrails after file edits.
- `Stop`: runs final backend, frontend, and skill guardrail checks.

Hooks only print reminders and run project guardrails. They must not execute external skills automatically.

## Trust

Codex may require `/hooks` review before project hooks run. Review and trust checked-in hooks before relying on them.

## Rule

If hooks and docs disagree, treat `AGENTS.md` and docs as source of truth, then update hooks/guardrails to match.
