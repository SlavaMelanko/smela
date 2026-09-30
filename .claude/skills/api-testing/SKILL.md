---
name: api-testing
description:
  Backend testing guidelines for apps/api (bun:test). Triggers - test, unit
  test, *.test.ts, __tests__, bun:test, mock, ModuleMocker, spy, stub, coverage,
  failing test, test setup, .env.test, describe, expect.
---

# API Testing Skill

## Quick Reference

- **App**: `apps/api`
- **Framework**: bun:test
- **File pattern**: `*.test.ts` inside `__tests__` directories
- **Runner**: `bun test src --parallel` — each file gets a fresh global (see
  [Test Isolation](#test-isolation))
- **Module mocking**: Use `ModuleMocker` from `@/__tests__` (see
  [patterns](references/mocking-patterns.md))
- **Coverage target**: 60–80% (focus on important logic, not 100%)
- **Config**: `apps/api/.env.test` for test environment variables

## Test Utilities (`apps/api/src/__tests__/`)

Before writing custom test helpers, check existing utilities:

- **`createTestApp(basePath, route, middleware[])`** - Creates test Hono app
  with error handler, logger, and optional middleware
- **`withClaims(claims?)`** - Claims-injection middleware that stands in for the
  real auth guard in route endpoint tests (pass role/permissions overrides)
- **`ModuleMocker(import.meta.url)`** - Module mocking utility (see
  [mocking patterns](references/mocking-patterns.md))
- **`post(app, url, body, headers)`** - POST request helper
- **`get(app, url, headers)`** - GET request helper
- **`patch(app, url, body, headers)`** - PATCH request helper
- **Fixtures** (`fixtures/`) - typed builders for shared test data:
  `buildTeam`, `buildTeamMember`, `createTeamAccessRepoMock` (team-access guard),
  `buildTokenRecord`, `buildInvalidTokenCases` (records the real
  `TokenValidator` rejects). Add a builder here instead of copying a fixture
  into a second file
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

## Naming

- **Top-level `describe`**: the unit under test, spelled as in code —
  `'BcryptHasher'`, `'createHasher'`, `'logger'`. When a file covers several
  exports of one module, use the module file name (`'url'`, `'email-urls'`) and
  nest one `describe` per export. Route tests use the mount context (see
  [Route Tests](#route-tests-indextestts-convention))
- **Nested `describe`**: only to split exports, methods, or routes (`'hash'`,
  `'GET /users/:id'`), or to share setup (`beforeEach`, a local app). Otherwise
  stay flat and put the condition in the `it` name. Name a setup group as a
  lowercase scenario (`'when token is expired'`) — no Title Case, no vague
  buckets like `'edge cases'`
- **`it`**: lowercase behavior in present tense, reading as a sentence —
  `it('rejects expired tokens')`, not `it('should reject expired tokens')`

## Test Types

- **Unit tests**: Run real code; mock only I/O you own (repositories, email,
  external APIs)
- **Integration tests**: Use real database, mock external APIs only
- **Endpoint tests**: Use `createTestApp()` with mocked use cases

## Route Tests (`index.test.ts` convention)

Route handlers are inlined in `index.ts` (Hono best practice), so they cannot be
imported directly — never write direct handler unit tests. Instead, write
endpoint tests through the mounted route:

- One `index.test.ts` per route `index.ts`, co-located in `__tests__/` — the
  test tree mirrors the route tree
- Mount the top of the resource group (e.g. `adminUsersRoute`), never the leaf,
  so `:id` params and nesting run the real chain
- Top-level describe is the mount context (e.g. `'admin /users'`), nested
  describes per route (e.g. `'GET /users/:id'`, `'PATCH /users/:id'`)
- Replace the group-level auth guard with `withClaims(...)`; the guard itself is
  covered in `middleware/auth/__tests__/`
- Per route, in chain order (~5–7 tests):
  1. Happy path — status, use case called with parsed input, response shape
  2. Validation — one reject per input source (param/query/body), assert the use
     case `not.toHaveBeenCalled()`; don't re-test `rules.ts` exhaustively
  3. Permission — one 403 with claims missing the permission
  4. Error propagation — use case throws → status via `onError`

See `src/routes/admin/users/$id/__tests__/index.test.ts` for the canonical
example.

## Test Isolation

`test` and `coverage` run with `--parallel`, which implies Bun's `--isolate`:
every test file gets its own `JSGlobalObject`, so module mocks, `globalThis`
mutations, and leaked handles cannot cross file boundaries.

What this does and does not change:

- **Across files**: isolation handles it. A `mock.module()` in one file can no
  longer affect another, which is the bug `ModuleMocker` was written for.
- **Within a file**: nothing changed. Mocks still persist from one `it()` to the
  next, so `afterEach` cleanup is still required — see [Cleanup](#cleanup).

Keep using `ModuleMocker`. It is still the pattern in ~56 files, and removing it
is tracked separately in [#32](https://github.com/SlavaMelanko/smela/issues/32);
`--isolate` is still experimental in Bun, so the suite should not depend on it
exclusively yet.

Two practical consequences:

- **Don't rely on cross-file state.** Anything a test needs must be set up in
  that file. This was always true in principle; it is now enforced.
- **Never log through a worker-backed transport in tests.** `pino.transport()`
  spawns a thread per global and crashes under isolation.
  `src/logging/logger.ts` uses `pino.destination({ sync: true })` when
  `isTestEnv()` — keep it that way.

Running a single file (`bun test path/to/file.test.ts`) skips `--parallel` and
is fine for local iteration.

## Environment Setup

- Use `apps/api/.env.test` for test-specific variables
- Bun handles env loading natively — no manual dotenv needed
- Minimize mocking `@/env` — only mock for special/invalid configs

## Mocking Strategy

A mock is a copy of real behavior that nothing keeps in sync. After a refactor
or library upgrade it can go stale while tests stay green. Prefer, in order:

1. **Real code**: pure helpers, `@/env` values from `.env.test`, `@/types`,
   deterministic security code (tokens, JWT, password hashing)
2. **Fakes**: in-memory implementations that pass the real implementation's
   contract tests
3. **Mocks**: only for I/O you own — `@/data` repositories, `@/services/email`,
   external API wrappers

Rules:

- Never mock third-party libraries (e.g. `hono/jwt`) — wrap them in own module
  and mock the wrapper only if it does I/O
- Don't mock encapsulated dependencies — mock the public API/wrapper only
- Route endpoint tests mock at the use-case boundary only (`@/use-cases/*` via
  `ModuleMocker`) — validators, `requirePermission`, and `onError` run real.
  Exception: middleware that calls repositories directly (e.g. the team-access
  guard) needs a typed `@/data` mock limited to the methods it calls
- Use global mocks for shared services (CAPTCHA, email) — don't redefine per
  test
- No real database or network calls in unit tests — all I/O must be mocked
- Prefer asserting results and state over call details; use
  `toHaveBeenCalledWith` only when the call itself is the behavior (e.g. an
  email was sent)
- Move decisions into pure functions so they can be tested without mocks
- Mock only methods the code under test calls — delete mocks the code no longer
  uses
- Never write tests that only exercise a mock (e.g. "hashing mock throws, so
  the use case throws")

### Real Security Code

Security modules run real in use-case tests:

- Passwords: build a real hash with `hashPassword` in `beforeAll` (bcrypt is
  slow) and assert stored hashes with `comparePasswordHashes`. Bcrypt reads at
  most 72 bytes of input
- One-time and refresh tokens: assert random values with `expect.any(String)`
  and `expect.any(Date)`; assert stored hashes equal `await hashToken(raw)`
- Access tokens: decode with `verifyJwt` and assert claims
- Token validation: feed real `TokenRecord` fixtures (expired, used, wrong
  type) to the real `TokenValidator`

## Type Safety

Type every mock against the real module, so a signature change breaks the
compile instead of passing silently:

```typescript
import type { userRepo } from '@/data'

mockUserRepo = {
  findByEmail: mock(async () => mockUser)
} satisfies Partial<typeof userRepo>

await moduleMocker.mock('@/data', () => ({ userRepo: mockUserRepo }))
```

Rules:

- Apply `satisfies` where the mock object is built. Assembling it from
  individual `any` mocks checks nothing
- Fixtures use real record types (`User`, `TeamMemberDetails`, `TokenRecord`)
  with enum values, never plain strings
- Return what the real repo returns — `undefined`, not `null`, when the type is
  `T | undefined`
- No casts (`as any`, `as unknown as T`) to silence a type error — fix the
  fixture
- Import types from public modules (`@/data`), never deep paths
  (`@/data/repositories/...`)

`let mockX: any` declarations are allowed, so later `mockImplementation()`
overrides are not type-checked — keep them consistent with the real type

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

Still required under `--isolate`. Isolation is per-file, not per-test: a module
mocked in one `it()` stays mocked for the rest of that file. The fresh global
only arrives with the next file.

Mocks built in `beforeEach` start with fresh call history, so `.mockClear()`
is only needed for mocks created once outside `beforeEach`.

## Assertions

- Assert rejections with `expect(promise).rejects` (no `await`, per the
  `ts/await-thenable` lint rule). Never use `try/catch` with
  `expect(true).toBe(false)` — the catch swallows that failure too

## Review Checklist

Before finishing a test file:

- [ ] Every mocked module is I/O you own — no `@/security/*`, `@/types`,
      `@/crypto`, `@/env` values from `.env.test`, pure helpers, or libraries
- [ ] Every repo mock uses `satisfies Partial<typeof repo>` where it is built
- [ ] Fixtures match real types; no casts
- [ ] Every mocked method is called by the code under test
- [ ] No test only checks a mock's behavior
- [ ] Rejections use `.rejects`, not `try/catch`
