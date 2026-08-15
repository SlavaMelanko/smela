# CLAUDE.md

## Project Overview

TypeScript backend API: Bun + Hono + PostgreSQL (Docker) with Drizzle ORM + JWT
auth. Provides authentication, user management, and role-based access control.

## Key Commands

All available commands are defined in [package.json](package.json). Key commands
include:

- **Development**: `bun run dev` (hot reload on port 3000)
- **Build**: `bun run build` (production, minified), `bun run build:staging`
  (staging, with source maps)
- **Testing**: `bun test` (all tests), `bun test [file]` (specific test file),
  `bun run coverage`
- **Database Dev**: `bun run db:dev:up` (start dev DB), `bun run db:dev:down`
  (stop dev DB), `bun run db:dev:reset` (reset dev DB), `bun run db:init`
  (generate + migrate + seed), `bun run db:ui` (Drizzle Studio)
- **Code Quality**: `bun run lint`, `bun run lint:fix`, `bun run check` (lint +
  tsc + test)
- **Email Dev**: `bun run emails` (React Email dev server on port 3001)

## Architecture Overview

**For detailed architecture documentation, see
[src/README.md](src/README.md)** - Describes the layered architecture, module
organization, and dependency rules.

### Route Organization

- Public routes: `/` (currently empty)
- Auth routes: `/api/v1/auth/*` (login, signup, email verification, resend
  verification, password reset)
- User routes: `/api/v1/user/*` (JWT-protected endpoints, allows new users)
- User verified routes: `/api/v1/user/verified/*` (JWT-protected endpoints,
  requires verified users)
- Admin routes: `/api/v1/admin/*` (JWT-protected endpoints, admin roles only)
- Owner routes: `/api/v1/owner/*` (JWT-protected endpoints, owner role only)

### API Routes Reference

See [postman.json](postman.json) for all API endpoints (import into Postman or
read directly).

### Database Schema

See [src/data/schema/](src/data/schema/) for Drizzle ORM table definitions.
Tables: auth, users, companies, tokens, etc.

### Search Implementation

ILIKE with GIN index (`gin_trgm_ops`). See
[src/data/migrations/custom/README.md](src/data/migrations/custom/README.md) for
details on index-query coupling, capabilities, and limitations.

### Database Connection

The project uses **PostgreSQL running in Docker** with connection pooling via
postgres.js (2 connections for dev/test, 10 for staging/prod). Database client
is configured in [src/data/clients/db.ts](src/data/clients/db.ts) using Drizzle
ORM with full transaction support.

### Authentication Flow

Signup → email verification (required before login) → JWT for authenticated
requests (returned in Set-Cookie header). Password reset uses one-time tokens.

### Frontend-Backend Architecture

- Email links point to frontend URLs (e.g.,
  `https://app.example.com/auth/verify-email?token=...`)
- Frontend extracts tokens from URL and makes POST requests to backend API
- Backend API validates tokens sent in JSON body (not URL parameters)
- This approach prevents tokens from appearing in server logs and provides
  better security

### Testing

**Read the testing skill before writing or modifying tests:**
`../../.claude/skills/api-testing/SKILL.md`

For detailed mocking patterns:
`../../.claude/skills/api-testing/references/mocking-patterns.md`

### Security Considerations

#### Authentication & Authorization

- JWT tokens with role-based access control (User, Admin, Owner)
- **Token Expiration Strategy**:
  - Access tokens: 15 minutes (configurable via JWT_EXPIRATION) - Short-lived
    for security
  - Refresh tokens: 30 days (configurable via COOKIE_REFRESH_TOKEN_EXPIRATION) -
    Stored in httpOnly cookies
  - Token rotation: New refresh token generated on each use, old token revoked
  - Rationale: Reduces attack surface, aligns with OAuth 2.0 best practices
- **JWT Secret Rotation**: Two-secret pattern — signing uses `JWT_SECRET`,
  verification falls back to optional `JWT_SECRET_PREVIOUS` during the grace
  period. Runbook: [README.md](README.md#-jwt-secret-rotation)
- Flexible authentication support (cookies for web, Bearer tokens for
  API/mobile)
- bcrypt password hashing with configurable salt rounds (default: 10 rounds)
- Email verification and secure password reset flows
- One-time use tokens for password reset with expiration
- Email enumeration attack prevention (consistent error responses)
- Environment variable validation on startup

#### Request Protection

- Rate limiting: 5 auth attempts/15min (production), 100 requests/15min
  (general)
- Request size limits: 10KB (auth), 100KB (general), 5MB (uploads)
- CORS with environment-specific origin validation
- Input validation using Zod schemas
- CAPTCHA protection: Google reCAPTCHA v2 (invisible) on auth endpoints
- **Zod schema strictness rule**:
  - Use `.strict()` on body schemas for: auth routes, payment endpoints,
    internal APIs (owner/admin)
  - Use default strip behavior for: public APIs, webhooks, backward-compatible
    endpoints
  - Query and param schemas intentionally omit `.strict()`

#### Security Headers

- Content Security Policy (CSP) with strict directives
- HSTS, X-Frame-Options, X-Content-Type-Options
- Permissions Policy restricting browser features
- Environment-specific configurations (dev/staging/production)

### Service Architecture Patterns

For external service integrations (CAPTCHA, payment, SMS, file storage,
analytics), use the **Modular Service Design Pattern**. This pattern provides
feature isolation, interface abstraction, and factory-based instantiation.

**See:** `.claude/skills/service-integration/SKILL.md` for complete pattern
guide with real examples from the codebase.

**Real implementations:**

- Simple example: `/src/services/captcha/` (single provider - Google reCAPTCHA)
- Advanced example: `/src/services/email/` (multiple providers - Ethereal +
  Resend with registry pattern)

### Coding Standards

- **ESLint Configuration**: Using @antfu/eslint-config with strict rules
- **File Naming**: Kebab-case for all files (except README.md, CLAUDE.md)
- **Import Style**: Path aliases using `@/` for src directory imports
- **Function Style**: Arrow functions preferred (`const funcName = () => {}`)
- **Code Style**: 2-space indentation, no semicolons, single quotes
- **Curly Braces**: Always required, even for single-line blocks
- **Environment Variables**: Access via `env` object, not `process.env` directly
- **Variable Naming Conventions**:
  - **camelCase**: Objects, arrays, and complex data structures (e.g.,
    `tokenTypeOptions`, `userConfig`)
  - **SCREAMING_SNAKE_CASE**: Primitives and simple constants (e.g.,
    `MAX_RETRY_COUNT`, `API_TIMEOUT`)
  - **PascalCase**: Classes, types, interfaces, and enums (e.g., `UserService`,
    `Status`, `EmailRenderer`)
- **Class Member Ordering**: Enforced via `@typescript-eslint/member-ordering`
  (see `eslint.config.mjs` for exact ordering)
- **Return Types**: Lean on TypeScript inference for simple functions. Add
  explicit return types when:
  - The function has complex conditional returns
  - You want compile-time protection against accidental contract changes
  - The inferred type is less clear than an explicit annotation

#### Comment Formatting Standards

See [Comment Formatting](../../CLAUDE.md#comment-formatting) in the root
CLAUDE.md.

#### Interface Implementation Naming Convention

When creating interfaces with multiple implementations, follow this naming
pattern:

**Interface Files:**

- **Filename**: Use kebab-case ending with the interface concept (e.g.,
  `email-renderer.ts`)
- **Interface Name**: Use PascalCase matching the concept (e.g.,
  `EmailRenderer`)

**Implementation Files:**

- **Filename**: Start with interface filename + implementation name (e.g.,
  `email-renderer-password-reset.ts`, `email-renderer-welcome.ts`)
- **Class Name**: Use PascalCase ending with interface name (e.g.,
  `PasswordResetEmailRenderer`, `WelcomeEmailRenderer`)

**Example Structures:**

_Email Renderers (following new convention):_

```text
src/emails/renderers/
├── email-renderer.ts                    # Interface: EmailRenderer
├── email-renderer-password-reset.ts     # Class: PasswordResetEmailRenderer
├── email-renderer-welcome.ts            # Class: WelcomeEmailRenderer
└── helper.ts                            # Utilities
```

_Email Providers (existing pattern):_

```text
src/services/email/providers/
├── provider.ts                          # Interface: EmailProvider
├── provider-ethereal.ts                 # Class: EtherealEmailProvider
├── provider-resend.ts                   # Class: ResendEmailProvider
├── payload.ts                           # Supporting types
├── factory.ts                           # Factory function
└── index.ts                             # Public exports
```

This convention groups implementations together alphabetically and makes the
relationship to the interface explicit.

#### Utils Directory Guidelines

`/src/utils/` is for genuinely generic utilities only: not domain-specific,
used in 2+ modules, single responsibility, documented with JSDoc. Name files by
domain (`async.ts`, `string.ts`), never `helpers.ts` or `common.ts`.
Single-use utilities must co-locate with their usage instead.

### Environment Configuration

**Bun Native Environment Loading:** Bun automatically loads environment files
based on `NODE_ENV` without requiring the `dotenv` package. See `.env.example`
for complete environment variable documentation, supported environments, and
configuration examples.

### Email Configuration

Ethereal for development (no real emails sent, preview URLs logged to
console); Resend for staging/production (requires `EMAIL_RESEND_API_KEY`).
Sender profiles live in the `email_sender_profiles` table, resolved at send
time.

### Middleware Stack Order

Middleware order matters — see [src/server.ts](src/server.ts) for the exact
stack.

### CORS Configuration

In production/staging, `ALLOWED_ORIGINS` must be a comma-separated list of
allowed frontend URLs. Development/test allow localhost/all origins.
