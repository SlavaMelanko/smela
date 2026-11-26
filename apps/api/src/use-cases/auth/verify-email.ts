import type { DeviceInfo } from '@/net/http/device'

import { db, userRepo } from '@/data'
import { TokenType } from '@/security/token'
import { UserStatus } from '@/types'

import { resolvePermissionList } from '../resolve-permissions'
import {
  consumeOneTimeToken,
  createAuthTokens,
  validateOneTimeToken
} from '../tokens'

export interface VerifyEmailInput {
  token: string
}

export const verifyEmail = async (
  { token }: VerifyEmailInput,
  deviceInfo: DeviceInfo
) => {
  const validatedToken = await validateOneTimeToken(
    token,
    TokenType.EmailVerification
  )

  const updatedUser = await db.transaction(async tx => {
    await consumeOneTimeToken(validatedToken.id, tx)

    // Update user status
    return userRepo.update(
      validatedToken.userId,
      { status: UserStatus.Verified },
      tx
    )
  })

  const permissions = await resolvePermissionList(updatedUser.id)

  const [accessToken, refreshToken] = await createAuthTokens(
    updatedUser,
    deviceInfo,
    permissions
  )

  return {
    data: { user: updatedUser, permissions, accessToken },
    refreshToken
  }
}
