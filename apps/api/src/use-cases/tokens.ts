import type { Database, User } from '@/data'
import type { DeviceInfo } from '@/net/http/device'
import type { InviteKind, InviteMetadata } from '@/security/token'
import type { Permission } from '@/types'

import { refreshTokenRepo, tokenRepo } from '@/data'
import { env } from '@/env'
import { AppError, ErrorCode } from '@/errors'
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

export const issueOneTimeToken = async (
  userId: string,
  type: TokenType,
  tx?: Database,
  metadata?: InviteMetadata
) => {
  const {
    token: { raw, hashed },
    expiresAt
  } = await generateHashedToken(type)

  await tokenRepo.issue(
    userId,
    { userId, type, tokenHash: hashed, expiresAt, metadata },
    tx
  )

  return raw
}

export const issueInviteToken = async (
  userId: string,
  kind: InviteKind,
  tx?: Database
) => issueOneTimeToken(userId, TokenType.UserInvite, tx, { kind })

// Tokens issued before invites carried a kind must be resent
export const readInviteKind = (metadata: InviteMetadata | null) => {
  if (!metadata) {
    throw new AppError(ErrorCode.TokenDeprecated, 'Invite token has no kind')
  }

  return metadata.kind
}

export const validateOneTimeToken = async (token: string, type: TokenType) => {
  const tokenRecord = await tokenRepo.findByHash(await hashToken(token))

  return TokenValidator.validate(tokenRecord, type)
}
