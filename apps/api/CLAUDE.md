# CLAUDE.md

## Project Overview

TypeScript backend API: Bun + Hono + PostgreSQL (Docker) with Drizzle ORM + JWT
auth. Provides authentication, user management, and role-based access control.

## Key Commands

See [package.json](package.json) for all commands. Most used:

- **Development**: `bun run dev` (hot reload on port 3000)
- **Testing**: `bun test [file]`, `bun run coverage`
- **Code Quality**: `bun run check` (lint + tsc + test)
- **Database Dev**: `bun run db:dev:up`, `bun run db:dev:reset`,
  `bun run db:init` (generate + migrate + seed), `bun run db:ui` (Drizzle
  Studio)
- **Email Dev**: `bun run emails` (React Email dev server on port 3001)

## Architecture

**Read [src/README.md](src/README.md)** for the layered architecture, module
organization, and dependency rules.

- **Routes**: `/api/v1/auth/*` (public), `/api/v1/user/*` (JWT),
  `/api/v1/user/verified/*` (JWT + verified), `/api/v1/admin/*`,
  `/api/v1/owner/*`. Full endpoint list in [postman.json](postman.json).
- **Schema**: [src/data/schema/](src/data/schema/) — Drizzle table definitions.
- **Middleware order matters** — see [src/server.ts](src/server.ts).
- **Search**: ILIKE with GIN index (`gin_trgm_ops`). Index-query coupling and
  limitations in
  [src/data/migrations/custom/README.md](src/data/migrations/custom/README.md).

### Auth Flow

Signup → email verification (required before login) → JWT returned in
`Set-Cookie`. Password reset uses one-time tokens.

Email links point to frontend URLs; the frontend extracts the token and POSTs it
to the API in the JSON body, never as a URL parameter — this keeps tokens out of
server logs.

### Service Integrations

For external services (CAPTCHA, payment, SMS, storage), follow the Modular
Service Design Pattern: `.claude/skills/service-integration/SKILL.md`. Reference
implementations: `/src/services/captcha/` (single provider),
`/src/services/email/` (multiple providers).

## Testing

**Read the testing skill before writing or modifying tests:**
`../../.claude/skills/api-testing/SKILL.md` (mocking patterns:
`references/mocking-patterns.md`).

## Security

Security decisions that aren't obvious from the code:

- **Token expiration**: access 15min (`JWT_EXPIRATION`), refresh 30 days
  (`COOKIE_REFRESH_TOKEN_EXPIRATION`), rotated on each use with the old token
  revoked. Short access-token life reduces attack surface per OAuth 2.0
  guidance.
- **JWT secret rotation**: signing uses `JWT_SECRET`, verification falls back to
  optional `JWT_SECRET_PREVIOUS` during the grace period. Runbook:
  [README.md](README.md#-jwt-secret-rotation).
- **Email enumeration**: auth endpoints return consistent responses whether or
  not the account exists.
- **Zod strictness**: use `.strict()` on body schemas for auth, payment, and
  internal (owner/admin) routes; default strip behavior for public APIs and
  webhooks. Query and param schemas intentionally omit `.strict()`.
- **Rate limits**: 5 auth attempts/15min (production), 100 requests/15min
  general. Request size caps: 10KB auth, 100KB general, 5MB uploads.

CSP, HSTS, and other security headers are configured per environment; CAPTCHA
(reCAPTCHA v2 invisible) guards auth endpoints.

## Coding Standards

- **ESLint**: @antfu/eslint-config, strict. Class member order is enforced by
  `ts/member-ordering` in
  [packages/eslint/src/typescript.js](../../packages/eslint/src/typescript.js).
- **Files**: kebab-case (except README.md, CLAUDE.md).
- **Imports**: `@/` path alias for src.
- **Style**: arrow functions, 2-space indent, no semicolons, single quotes,
  curly braces always.
- **Naming**: camelCase for objects/arrays, SCREAMING_SNAKE_CASE for primitive
  constants, PascalCase for classes/types/interfaces/enums.
- **Env vars**: access via the `env` object, never `process.env` directly.
- **Return types**: lean on inference; annotate when returns are conditional,
  when you want protection against contract drift, or when the inferred type is
  unclear.
- **Comments**: see [Comment Formatting](../../CLAUDE.md#comment-formatting).

### Interface Implementation Naming

Interface file is named for the concept (`email-renderer.ts` → `EmailRenderer`).
Implementation files are named for what they implement (`password-reset.ts` →
`PasswordResetEmailRenderer`), prefixed with the interface name only when the
bare concept would be ambiguous in that directory.

```text
src/emails/renderers/
├── email-renderer.ts    # Interface: EmailRenderer
├── password-reset.ts    # Class: PasswordResetEmailRenderer
└── helper.ts            # Utilities
```

### Utils Directory

`/src/utils/` is for genuinely generic utilities only: not domain-specific, used
in 2+ modules, single responsibility, documented with JSDoc. Name files by
domain (`async.ts`, `string.ts`), never `helpers.ts` or `common.ts`. Single-use
utilities co-locate with their usage instead.

## Configuration

- **Env loading**: Bun loads env files natively by `NODE_ENV` — no dotenv. See
  `.env.example` for all variables.
- **Email**: Ethereal in development (preview URLs logged, no real sends),
  Resend for staging/production (`EMAIL_RESEND_API_KEY`). Sender profiles live
  in the `email_sender_profiles` table, resolved at send time.
- **Database**: PostgreSQL in Docker, pooled via postgres.js (2 connections
  dev/test, 10 staging/prod). Client:
  [src/data/clients/db.ts](src/data/clients/db.ts).
- **CORS**: production/staging require `ALLOWED_ORIGINS` as a comma-separated
  list; development/test allow localhost.
