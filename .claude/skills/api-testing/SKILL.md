---
name: api-testing
description:
  Testing guidelines for Bun/TypeScript projects using bun:test framework. Use
  when writing tests, creating test files, debugging test failures, setting up
  mocks, or reviewing test code. Triggers on *.test.ts files, test-related
  questions, mocking patterns, and coverage discussions.
---

# API Testing Skill

## Quick Reference

- **App**: `apps/api`
- **Framework**: bun:test
- **File pattern**: `*.test.ts` inside `__tests__` directories
- **Module mocking**: Use `ModuleMocker` from `@/__tests__` (see
  [patterns](references/mocking-patterns.md))
- **Coverage target**: 60–80% (focus on important logic, not 100%)
- **Config**: `apps/api/.env.test` for test environment variables

## Test Utilities (`apps/api/src/__tests__/`)

Before writing custom test helpers, check existing utilities:

- **`createTestApp(basePath, route, middleware[])`** - Creates test Hono app
  with error handler, logger, and optional middleware
- **`ModuleMocker(import.meta.url)`** - Module mocking utility (see
  [mocking patterns](references/mocking-patterns.md))
- **`post(app, url, body, headers)`** - POST request helper
- **`get(app, url, headers)`** - GET request helper
- **`doRequest(app, url, method, body, headers)`** - Generic request helper

Example:

```typescript
import { createTestApp, post } from '@/__tests__'

const app = createTestApp('/api/v1/auth', signupRoute, [verifyCaptcha()])
const response = await post(app, '/api/v1/auth/signup', {
  email: 'test@example.com',
  password: 'SecurePass123!'
})
```

## Test Types

- **Unit tests**: Mock all dependencies (repositories, services, APIs)
- **Integration tests**: Use real database, mock external APIs only
- **Endpoint tests**: Use `createTestApp()` with mocked services

## Environment Setup

- Use `apps/api/.env.test` for test-specific variables
- Bun handles env loading natively — no manual dotenv needed
- Minimize mocking `@/env` — only mock for special/invalid configs

## Mocking Strategy

- Mock only business logic dependencies (repositories, external APIs)
- Use global mocks for shared services (CAPTCHA, email) — don't redefine per
  test
- No real database or network calls — all I/O must be mocked
- Don't mock encapsulated dependencies — mock the public API/wrapper only

## Type Safety

- Prefer proper types and `Partial<T>` for mocks; allow `any` only where full
  typing adds unnecessary complexity

## Mocking Patterns

For detailed mocking patterns including variable ordering, `beforeEach` setup,
and ModuleMocker usage, see
[references/mocking-patterns.md](references/mocking-patterns.md).

## Cleanup

Always clean up side effects after each test:

```typescript
afterEach(async () => {
  await moduleMocker.clear() // restore mocked modules
})
```

Use `.mockClear()` on individual bun:test mocks when call history must reset
between tests.
