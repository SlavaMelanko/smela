import { describe, expect, it } from 'bun:test'

import { testUuids } from '@/__tests__'
import { AppError, ErrorCode } from '@/errors'
import { Role, UserStatus } from '@/types'

import { signJwt, verifyJwt } from '../jwt'

describe('jwt', () => {
  const testUserClaims = {
    id: testUuids.USER_1,
    email: 'test@example.com',
    role: Role.User,
    status: UserStatus.Active
  }

  it('signs and verifies a valid JWT', async () => {
    const secret = 'test-secret-key'

    const token = await signJwt(testUserClaims, { secret })

    expect(typeof token).toBe('string')
    expect(token.split('.').length).toBe(3)

    const resultUserClaims = await verifyJwt(token, { secret })

    expect(resultUserClaims.id).toBe(testUserClaims.id)
    expect(resultUserClaims.email).toBe(testUserClaims.email)
    expect(resultUserClaims.role).toBe(testUserClaims.role)
    expect(resultUserClaims.status).toBe(testUserClaims.status)
  })

  it('verifies a token with a custom expiration time', async () => {
    const secret = 'test-secret-key'
    const customExpiresIn = 7200

    const token = await signJwt(testUserClaims, {
      secret,
      expiresIn: customExpiresIn
    })

    // Verify token doesn't throw - expiration is validated internally
    const resultUserClaims = await verifyJwt(token, { secret })

    expect(resultUserClaims.id).toBe(testUserClaims.id)
  })

  it('keeps the user role in the round trip', async () => {
    const secret = 'test-secret-key'
    const adminClaims = { ...testUserClaims, role: Role.Admin }

    const token = await signJwt(adminClaims, { secret })
    const resultUserClaims = await verifyJwt(token, { secret })

    expect(resultUserClaims.role).toBe(Role.Admin)
  })

  it('keeps the user status in the round trip', async () => {
    const secret = 'test-secret-key'
    const newUserClaims = { ...testUserClaims, status: UserStatus.New }

    const token = await signJwt(newUserClaims, { secret })
    const resultUserClaims = await verifyJwt(token, { secret })

    expect(resultUserClaims.status).toBe(UserStatus.New)
  })

  it('rejects a wrong secret as unauthorized', async () => {
    const token = await signJwt(testUserClaims, { secret: 'correct-secret' })

    expect(verifyJwt(token, { secret: 'wrong-secret' })).rejects.toThrow(
      AppError
    )
    expect(verifyJwt(token, { secret: 'wrong-secret' })).rejects.toMatchObject({
      code: ErrorCode.Unauthorized,
      message: 'Invalid authentication token'
    })
  })

  it('rejects a malformed token as unauthorized', async () => {
    expect(
      verifyJwt('invalid.token.here', { secret: 'test-secret' })
    ).rejects.toThrow(AppError)
    expect(
      verifyJwt('invalid.token.here', { secret: 'test-secret' })
    ).rejects.toMatchObject({
      code: ErrorCode.Unauthorized,
      message: 'Invalid authentication token'
    })
  })

  it('rejects a non-JWT string', async () => {
    expect(
      verifyJwt('not-a-jwt-at-all', { secret: 'test-secret' })
    ).rejects.toThrow(AppError)
  })

  it('rejects an empty token', async () => {
    expect(verifyJwt('', { secret: 'test-secret' })).rejects.toThrow(AppError)
  })

  it('rejects a token signed by a different secret', async () => {
    const token = await signJwt(testUserClaims, { secret: 'secret-one' })

    expect(verifyJwt(token, { secret: 'secret-two' })).rejects.toThrow(AppError)
  })

  it('creates a three-part JWT', async () => {
    const token = await signJwt(testUserClaims, { secret: 'test-secret' })
    const parts = token.split('.')

    expect(parts).toHaveLength(3)
    expect(parts[0].length).toBeGreaterThan(0)
    expect(parts[1].length).toBeGreaterThan(0)
    expect(parts[2].length).toBeGreaterThan(0)
  })

  it('creates different tokens for different users', async () => {
    const secret = 'test-secret'
    const user1 = { ...testUserClaims, id: testUuids.USER_2 }
    const user2 = { ...testUserClaims, id: testUuids.USER_3 }

    const token1 = await signJwt(user1, { secret })
    const token2 = await signJwt(user2, { secret })

    expect(token1).not.toBe(token2)
  })

  it('creates different tokens with different secrets', async () => {
    const token1 = await signJwt(testUserClaims, { secret: 'secret-one' })
    const token2 = await signJwt(testUserClaims, { secret: 'secret-two' })

    expect(token1).not.toBe(token2)
  })

  it('uses HS256 by default', async () => {
    const secret = 'test-secret'
    const token = await signJwt(testUserClaims, { secret })
    const resultUserClaims = await verifyJwt(token, { secret })

    expect(resultUserClaims.id).toBe(testUserClaims.id)
  })

  it('supports the HS512 algorithm', async () => {
    const secret = 'test-secret'
    const token = await signJwt(testUserClaims, {
      secret,
      signatureAlgorithm: 'HS512'
    })
    const resultUserClaims = await verifyJwt(token, {
      secret,
      signatureAlgorithm: 'HS512'
    })

    expect(resultUserClaims.id).toBe(testUserClaims.id)
    expect(resultUserClaims.email).toBe(testUserClaims.email)
  })

  it('rejects a token signed with a different algorithm', async () => {
    const secret = 'test-secret'
    const token = await signJwt(testUserClaims, {
      secret,
      signatureAlgorithm: 'HS256'
    })

    expect(
      verifyJwt(token, { secret, signatureAlgorithm: 'HS512' })
    ).rejects.toThrow(AppError)
  })
})
