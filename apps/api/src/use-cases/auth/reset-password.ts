import type { DeviceInfo } from '@/net/http/device'

import { authRepo, db, refreshTokenRepo, userRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { hashPassword } from '@/security/password'
import { TokenType } from '@/security/token'

import { resolvePermissionList } from '../resolve-permissions'
import { resolveUserTeams } from '../resolve-team'
import {
  consumeOneTimeToken,
  createAuthTokens,
  validateOneTimeToken
} from '../tokens'

export interface ResetPasswordInput {
  token: string
  password: string
}

export const resetPassword = async (
  { token, password }: ResetPasswordInput,
  deviceInfo: DeviceInfo
) => {
  const validatedToken = await validateOneTimeToken(
    token,
    TokenType.PasswordReset
  )

  await db.transaction(async tx => {
    await consumeOneTimeToken(validatedToken.id, tx)

    // Update user's password
    const passwordHash = await hashPassword(password)
    await authRepo.update(validatedToken.userId, { passwordHash }, tx)

    // Sign out every existing session, since reset is how users recover
    // from a compromised account
    await refreshTokenRepo.revokeByUserId(validatedToken.userId, undefined, tx)
  })

  const user = await userRepo.findById(validatedToken.userId)

  if (!user) {
    throw new AppError(
      ErrorCode.InternalError,
      'User not found after password reset'
    )
  }

  const [userTeams, permissions] = await Promise.all([
    resolveUserTeams(user.id),
    resolvePermissionList(user.id)
  ])

  const [accessToken, refreshToken] = await createAuthTokens(
    user,
    deviceInfo,
    permissions
  )

  return {
    data: { user, ...userTeams, permissions, accessToken },
    refreshToken
  }
}
