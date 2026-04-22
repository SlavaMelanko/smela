# CLAUDE.md

## Project Structure

### Apps

- `apps/api` — Bun/Hono backend (see [apps/api/CLAUDE.md](apps/api/CLAUDE.md))
- `apps/web` — React/Vite frontend (see
  [apps/web/CLAUDE.md](apps/web/CLAUDE.md))
- `apps/admin` — Admin interface (see
  [apps/admin/CLAUDE.md](apps/admin/CLAUDE.md))

### Packages

- `packages/e2e` — E2E testing utilities (see
  [packages/e2e/README.md](packages/e2e/README.md))
- `packages/eslint` — ESLint configurations
- `packages/i18n` — Internationalization utilities
- `packages/ui` — Shared UI components

## Dev Notes

### Prerequisites

- [Git](https://git-scm.com/)
- [Bun](https://bun.sh/) (see [.bun-version](.bun-version))
- [tmux](https://github.com/tmux/tmux/wiki)
- [Docker](https://www.docker.com/) for running PostgreSQL

### Notes

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
