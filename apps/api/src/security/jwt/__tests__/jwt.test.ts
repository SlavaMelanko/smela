import { describe, expect, it } from 'bun:test'

import { testUuids } from '@/__tests__'
import { ErrorCode } from '@/errors'
import { Role, UserStatus } from '@/types'

import type { UserClaims } from '../claims'

import { signJwt, verifyJwt } from '../jwt'

describe('JWT', () => {
  const SECRET = 'current-secret-key'
  const PREVIOUS_SECRET = 'previous-secret-key'

  const userClaims: UserClaims = {
    id: testUuids.USER_1,
    email: 'test@example.com',
    role: Role.User,
    status: UserStatus.Active
  }

  const unauthorized = {
    code: ErrorCode.Unauthorized,
    message: 'Invalid authentication token'
  }

  it('should return user claims for a token it signed', async () => {
    const token = await signJwt(userClaims, { secret: SECRET })

    expect(verifyJwt(token, { secret: SECRET })).resolves.toEqual(userClaims)
  })

  it('should keep optional permissions in the round trip', async () => {
    const claims = { ...userClaims, permissions: ['view:users'] }
    const token = await signJwt(claims, { secret: SECRET })

    expect(verifyJwt(token, { secret: SECRET })).resolves.toEqual(claims)
  })

  it('should reject a tampered token', async () => {
    const userToken = await signJwt(userClaims, { secret: SECRET })
    const ownerToken = await signJwt(
      { ...userClaims, role: Role.Owner },
      { secret: SECRET }
    )
    const [header, , signature] = userToken.split('.')
    const [, ownerPayload] = ownerToken.split('.')
    const tamperedToken = [header, ownerPayload, signature].join('.')

    expect(verifyJwt(tamperedToken, { secret: SECRET })).rejects.toMatchObject(
      unauthorized
    )
  })

  it('should reject an expired token', async () => {
    const token = await signJwt(userClaims, { secret: SECRET, expiresIn: -60 })

    expect(verifyJwt(token, { secret: SECRET })).rejects.toMatchObject(
      unauthorized
    )
  })

  it('should reject a token signed with a different secret', async () => {
    const token = await signJwt(userClaims, { secret: 'other-secret-key' })

    expect(
      verifyJwt(token, { secret: SECRET, previousSecret: PREVIOUS_SECRET })
    ).rejects.toMatchObject(unauthorized)
  })

  it('should accept a token signed with the previous secret', async () => {
    const token = await signJwt(userClaims, { secret: PREVIOUS_SECRET })

    expect(
      verifyJwt(token, { secret: SECRET, previousSecret: PREVIOUS_SECRET })
    ).resolves.toEqual(userClaims)
  })

  it('should reject a token signed with the previous secret when no previous secret is configured', async () => {
    const token = await signJwt(userClaims, { secret: PREVIOUS_SECRET })

    expect(
      verifyJwt(token, { secret: SECRET, previousSecret: undefined })
    ).rejects.toMatchObject(unauthorized)
  })
})
