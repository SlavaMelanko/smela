# CLAUDE.md

## Project Structure

### Apps

- `apps/api` — Bun/Hono backend (see [apps/api/CLAUDE.md](apps/api/CLAUDE.md))
- `apps/web` — React/Vite frontend (see
  [apps/web/CLAUDE.md](apps/web/CLAUDE.md))
- `apps/admin` — Admin interface (see
  [apps/admin/CLAUDE.md](apps/admin/CLAUDE.md))

### Packages

- `packages/contracts` — Shared API/web contracts (roles, user statuses,
  validation constraints)
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
- Keep comments general — describe intent, not current values or enumerated
  items. Specific comments become stale when lists change and nobody remembers
  to update them. Prefer `// Check hidden menu items` over
  `// Invite and Remove actions must be hidden`.
