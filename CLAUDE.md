# smela

This starter kit is a ready-to-use template for full-stack web applications.
Copy it and build your business features on top of authentication,
multi-tenancy, role-based access control, and permission-based access.

## What Makes It Special

- **Architecture first**: The project prioritizes clear architectural decisions
  that simplify future development, extension, and maintenance. Its modular
  design helps new business features grow without unnecessary complexity.

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
- `packages/emails` — Email templates, renderers, and providers (React Email)
- `packages/eslint` — ESLint configurations
- `packages/i18n` — Internationalization utilities
- `packages/ui` — Shared UI components

## Prerequisites

- [Git](https://git-scm.com/)
- [Bun](https://bun.sh/) (see [.bun-version](.bun-version))
- [tmux](https://github.com/tmux/tmux/wiki)
- [Docker](https://www.docker.com/) for running PostgreSQL

## Coding Standards

### Comment Formatting

Prefer descriptive names for variables, functions, and classes instead of
comments. When a comment is necessary:

- **Trailing comments**: keep short, no uppercase letter at beginning, no dot at
  end

  ```typescript
  const timeout = 5000 // milliseconds
  ```

- **Full-line comments (single sentence)**: start with uppercase letter, no dot
  at end

  ```typescript
  // Validate user permissions before processing request
  const hasPermission = await checkUserRole(userId)
  ```

- **Full-line comments (multiple sentences)**: start with uppercase letter, use
  dots between sentences but not at the end

  ```typescript
  // Initialize database connection pool. This ensures optimal performance
  // for concurrent requests. The pool size is configured via environment variables
  const pool = createConnectionPool()
  ```

## Dev Notes

- When upgrading React, update the `version` field in
  `packages/eslint/src/react.js` → `settings.react.version`.
