# Mocking Patterns Reference

Detailed patterns for ModuleMocker and mock setup in bun:test.

## Table of Contents

1. [Why ModuleMocker](#why-modulemocker)
2. [Variable Declaration Order](#variable-declaration-order)
3. [Initial Mock Setup in beforeEach](#initial-mock-setup-in-beforeeach)
4. [Module Mocking Rules](#module-mocking-rules)
5. [Updating Mock Behavior](#updating-mock-behavior)
6. [Complete Example](#complete-example)

## Why ModuleMocker

`mock.module()` writes to a global module registry, and `mock.restore()` does
not undo it ([oven-sh/bun#7823](https://github.com/oven-sh/bun/issues/7823),
still open). `ModuleMocker` re-applies the original module in `afterEach`.

The suite also runs with `--parallel`, so each file gets a fresh global and
mocks can no longer leak _between files_. That covers the cross-file half of the
problem, but not the within-file half: a module mocked in one `it()` stays
mocked for the remainder of that file.

So `ModuleMocker` is still the pattern here — keep using it, and keep the
`afterEach` cleanup. Replacing it is tracked in
[#32](https://github.com/SlavaMelanko/smela/issues/32) and is on hold while
`--isolate` is experimental.

## Variable Declaration Order

Group variables by module with blank lines between groups. Order groups to match
their initialization in `beforeEach`:

```typescript
const moduleMocker = new ModuleMocker(import.meta.url)

const PASSWORD = 'ValidPass123!' // test data group
let passwordHash: string

let mockUser: User // @/data module group
let mockUserRepo: any
let mockAuthRepo: any

let mockEmailService: any // @/services/email module group
```

## Initial Mock Setup in beforeEach

**Core principle**: Use `const` for static test data that never changes, use
`let` + `beforeEach` for mocks needing re-initialization.

**Pattern**: Follow small → large dependency chain within each module group.

Setup sequence:

1. Initialize test data and primitive constants
2. Initialize fixtures typed with real record types
3. Build each mock object with `satisfies Partial<typeof realModule>`
4. Call `moduleMocker.mock()` immediately after defining related mocks
5. Repeat for each module: fixtures → typed mock objects → `moduleMocker.mock()`

```typescript
describe('Signup', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const EMAIL = 'test@example.com'

  let mockUser: User
  let mockUserRepo: any
  let mockEmailService: any

  beforeEach(async () => {
    // @/data module group
    mockUser = {
      id: testUuids.USER_1,
      email: EMAIL,
      role: Role.User,
      status: UserStatus.New
      // ...remaining User fields
    }
    mockUserRepo = {
      findByEmail: mock(async () => undefined),
      create: mock(async () => mockUser)
    } satisfies Partial<typeof userRepo>

    await moduleMocker.mock('@/data', () => ({
      userRepo: mockUserRepo
    }))

    // @/services/email module group
    mockEmailService = {
      send: mock(async () => ({ provider: 'ethereal', messageId: 'test-id' }))
    } satisfies Partial<typeof emailService>

    await moduleMocker.mock('@/services/email', () => ({
      emailService: mockEmailService
    }))
  })
})
```

## Module Mocking Rules

1. Use `moduleMocker.mock()` ONLY in `beforeEach` for initial module mocking
2. Never use `moduleMocker.mock()` in individual test cases
3. Always define mock object variable before calling `moduleMocker.mock()` with
   it
4. Call `moduleMocker.mock()` immediately after defining all related mock
   objects
5. **Mock only I/O you own**: `@/data`, `@/services/*`, network wrappers. Keep
   `@/security/*`, `@/crypto`, `@/types`, `@/env`, and pure helpers real (see
   Mocking Strategy in [SKILL.md](../SKILL.md))
6. **Don't mock encapsulated dependencies**: Only mock the public API/wrapper,
   not underlying implementation
   - Example: If `@/net/http/cookie` wraps `hono/cookie`, only mock the wrapper
7. **Type mocks where they are built**: `satisfies Partial<typeof realModule>`
   on the object literal, not on variables assembled from `any` mocks

## Updating Mock Behavior

Use `mockImplementation()` to update mock behavior in individual tests:

```typescript
it('should handle user not found', async () => {
  // Override default mock behavior for this test only
  mockUserRepo.findByEmail.mockImplementation(async () => undefined)

  // Act & Assert
  expect(service.login(email)).rejects.toThrow('User not found')
})
```

Other mock utilities: `mockReturnValue`, `mockResolvedValue`,
`mockRejectedValue`

## Complete Example

Real security code with typed I/O mocks (see
`src/use-cases/auth/__tests__/login.test.ts`):

```typescript
import type { authRepo, AuthRecord, User, userRepo } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import { ErrorCode } from '@/errors'
import { verifyJwt } from '@/security/jwt'
import { hashPassword } from '@/security/password'

describe('Login with Email', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const PASSWORD = 'ValidPass123!'
  let passwordHash: string

  let mockUser: User
  let mockUserRepo: any
  let mockAuthRecord: AuthRecord
  let mockAuthRepo: any

  beforeAll(async () => {
    passwordHash = await hashPassword(PASSWORD) // bcrypt is slow, hash once
  })

  beforeEach(async () => {
    mockUser = { id: testUuids.USER_1, role: Role.User /* ... */ }
    mockUserRepo = {
      findByEmail: mock(async () => mockUser)
    } satisfies Partial<typeof userRepo>
    mockAuthRecord = { userId: mockUser.id, passwordHash /* ... */ }
    mockAuthRepo = {
      findById: mock(async () => mockAuthRecord)
    } satisfies Partial<typeof authRepo>

    await moduleMocker.mock('@/data', () => ({
      userRepo: mockUserRepo,
      authRepo: mockAuthRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should sign an access token with user claims', async () => {
    const result = await logInWithEmail(
      { email: mockUser.email, password: PASSWORD },
      deviceInfo
    )

    expect(verifyJwt(result.data.accessToken)).resolves.toMatchObject({
      id: mockUser.id,
      role: mockUser.role
    })
  })

  it('should reject a wrong password', async () => {
    expect(
      logInWithEmail({ email: mockUser.email, password: 'Wrong123!' }, deviceInfo)
    ).rejects.toMatchObject({ code: ErrorCode.InvalidCredentials })
  })
})
```
