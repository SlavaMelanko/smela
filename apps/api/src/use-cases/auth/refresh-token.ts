import type { RefreshToken } from '@/data'
import type { DeviceInfo } from '@/net/http/device'

import { db, refreshTokenRepo, userRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { logger } from '@/logging'
import { hashToken } from '@/security/token'
import { isNewOrActive } from '@/types'
import { seconds } from '@/utils/chrono'

import { resolvePermissionList } from '../resolve-permissions'
import { resolveUserTeams } from '../resolve-team'
import { createAccessToken, createRefreshToken } from '../tokens'

// Tabs that refresh at the same time present the same token. Only a token
// replayed after this window counts as theft
const REUSE_GRACE_PERIOD_MS = seconds(30)

const rejectRevokedToken = async ({ userId, revokedAt }: RefreshToken) => {
  const revokedAgoMs = Date.now() - (revokedAt?.getTime() ?? 0)

  if (revokedAgoMs > REUSE_GRACE_PERIOD_MS) {
    logger.warn(
      { userId },
      'Refresh token reuse detected, revoking all sessions'
    )
    await refreshTokenRepo.revokeByUserId(userId)
  }

  throw new AppError(ErrorCode.RefreshTokenRevoked)
}

const validateToken = async (refreshToken: string | undefined) => {
  if (!refreshToken) {
    throw new AppError(ErrorCode.MissingRefreshToken)
  }

  const hashedToken = await hashToken(refreshToken)
  const storedToken = await refreshTokenRepo.findByHash(hashedToken)

  if (!storedToken) {
    throw new AppError(ErrorCode.InvalidRefreshToken)
  }

  if (storedToken.revokedAt) {
    await rejectRevokedToken(storedToken)
  }

  if (storedToken.expiresAt < new Date()) {
    throw new AppError(ErrorCode.RefreshTokenExpired)
  }

  return { storedToken, hashedToken }
}

const validateDevice = (
  storedToken: { ipAddress: string | null; userAgent: string | null },
  deviceInfo: DeviceInfo,
  userId: string
) => {
  const ipChanged = storedToken.ipAddress !== deviceInfo.ipAddress
  const userAgentChanged = storedToken.userAgent !== deviceInfo.userAgent

  if (ipChanged || userAgentChanged) {
    logger.warn(
      {
        userId,
        oldIp: storedToken.ipAddress,
        newIp: deviceInfo.ipAddress,
        oldUserAgent: storedToken.userAgent,
        newUserAgent: deviceInfo.userAgent
      },
      'Device change detected during token refresh'
    )
  }
}

export interface RefreshAuthTokensInput {
  refreshToken: string | undefined
}

export const refreshAuthTokens = async (
  { refreshToken }: RefreshAuthTokensInput,
  deviceInfo: DeviceInfo
) => {
  const { storedToken, hashedToken } = await validateToken(refreshToken)

  const [user, userTeams] = await Promise.all([
    userRepo.findById(storedToken.userId),
    resolveUserTeams(storedToken.userId)
  ])

  if (!user || !isNewOrActive(user.status)) {
    throw new AppError(ErrorCode.InvalidRefreshToken)
  }

  validateDevice(storedToken, deviceInfo, user.id)

  const permissions = await resolvePermissionList(user.id)

  const [accessToken, newRefreshToken] = await Promise.all([
    createAccessToken(user, permissions),
    db.transaction(async tx => {
      // Create new refresh token first (OAuth 2.0 best practice)
      const newRefreshToken = await createRefreshToken(user.id, deviceInfo, tx)

      // Revoke only succeeds while the token is still active, so exactly one
      // of several concurrent refreshes wins. The loser rolls back its new token
      const isRevoked = await refreshTokenRepo.revokeByHash(hashedToken, tx)

      if (!isRevoked) {
        throw new AppError(ErrorCode.RefreshTokenRevoked)
      }

      return newRefreshToken
    })
  ])

  return {
    data: { user, ...userTeams, permissions, accessToken },
    refreshToken: newRefreshToken
  }
}
