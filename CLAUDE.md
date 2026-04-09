# CLAUDE.md

## Project Structure

- `apps/api` — Bun/Hono backend (see [apps/api/CLAUDE.md](apps/api/CLAUDE.md))
- `apps/web` — React/Vite frontend (see
  [apps/web/CLAUDE.md](apps/web/CLAUDE.md))

## Dev Notes

- When upgrading React, update the `version` field in
  `packages/eslint/src/react.js` → `settings.react.version`.

## Skills

### apps/web

- [react-artisan](.claude/skills/react-artisan/SKILL.md) — React component
  patterns, hooks, composition, code quality, and file/folder organization
- [tailwind-shadcn](.claude/skills/tailwind-shadcn/SKILL.md) — Tailwind CSS and
  shadcn/ui styling conventions
- [i18n](.claude/skills/i18n/SKILL.md) — Internationalization and translation
  patterns
- [e2e-testing](.claude/skills/e2e-testing/SKILL.md) — Playwright E2E test
  writing and infrastructure
- [review](.claude/skills/review/SKILL.md) — Code review against all web
  conventions

### apps/api

- [api-testing](.claude/skills/api-testing/SKILL.md) — Bun/TypeScript test
  writing with bun:test and mocking patterns
- [service-integration](.claude/skills/service-integration/SKILL.md) — Modular
  design pattern for external service integrations

### Common

- [cloc](.claude/skills/cloc/SKILL.md) — Count lines of code across all apps
- [release](.claude/skills/release/SKILL.md) — Release advisor: analyses
  changes, suggests next version, outputs a ready-to-follow release checklist
