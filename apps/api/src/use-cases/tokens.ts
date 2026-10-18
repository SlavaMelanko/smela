import type { Database, User } from '@/data'
import type { DeviceInfo } from '@/net/http/device'
import type { Permission } from '@/types'

import { refreshTokenRepo, tokenRepo } from '@/data'
import { env } from '@/env'
import { signJwt } from '@/security/jwt'
import {
  generateHashedToken,
  hashToken,
  TokenType,
  TokenValidator
} from '@/security/token'

export const createAccessToken = async (
  user: User,
  permissions?: Permission[]
) =>
  signJwt({
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    permissions
  })

export const createRefreshToken = async (
  userId: string,
  deviceInfo: DeviceInfo,
  tx?: Database
) => {
  const {
    token: { raw, hashed },
    expiresAt
  } = await generateHashedToken(TokenType.RefreshToken, {
    expirySeconds: env.COOKIE_REFRESH_TOKEN_EXPIRATION
  })

  await refreshTokenRepo.create(
    {
      userId,
      tokenHash: hashed,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      expiresAt
    },
    tx
  )

  return raw
}

export const createAuthTokens = async (
  user: User,
  deviceInfo: DeviceInfo,
  permissions?: Permission[],
  tx?: Database
) =>
  Promise.all([
    createAccessToken(user, permissions),
    createRefreshToken(user.id, deviceInfo, tx)
  ])

// Only the hash is stored, so a leaked database can't be used to redeem tokens
export const issueOneTimeToken = async (
  userId: string,
  type: TokenType,
  tx: Database
) => {
  const {
    token: { raw, hashed },
    expiresAt
  } = await generateHashedToken(type)

  await tokenRepo.issue(
    userId,
    { userId, type, tokenHash: hashed, expiresAt },
    tx
  )

  return raw
}

export const validateOneTimeToken = async (token: string, type: TokenType) => {
  const tokenRecord = await tokenRepo.findByHash(await hashToken(token))

  return TokenValidator.validate(tokenRecord, type)
}
