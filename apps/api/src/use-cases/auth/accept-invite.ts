import type { DeviceInfo } from '@/net/http/device'
import type { InviteMetadata } from '@/security/token'

import { authRepo, db, tokenRepo, userRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { hashPassword } from '@/security/password'
import { InviteKind, TokenStatus, TokenType } from '@/security/token'
import { UserStatus } from '@/types'

import { resolvePermissionList } from '../resolve-permissions'
import { resolveUserTeam } from '../resolve-team'
import { createAuthTokens, validateOneTimeToken } from '../tokens'

export interface AcceptInviteInput {
  token: string
  password: string
}

// The invite link proves the email like the verification link does.
// Admins need Active because the admin app accepts only that status.
// Tokens issued before invites carried a kind must be resent
const resolveAcceptedStatus = (metadata: InviteMetadata | null) => {
  if (!metadata) {
    throw new AppError(ErrorCode.TokenDeprecated, 'Invite token has no kind')
  }

  return metadata.kind === InviteKind.Admin
    ? UserStatus.Active
    : UserStatus.Verified
}

export const acceptInvite = async (
  { token, password }: AcceptInviteInput,
  deviceInfo: DeviceInfo
) => {
  const validatedToken = await validateOneTimeToken(token, TokenType.UserInvite)

  const status = resolveAcceptedStatus(validatedToken.metadata)

  const user = await db.transaction(async tx => {
    // Mark token as used
    await tokenRepo.update(
      validatedToken.id,
      {
        status: TokenStatus.Used,
        usedAt: new Date()
      },
      tx
    )

    // Update user's password
    const passwordHash = await hashPassword(password)
    await authRepo.update(validatedToken.userId, { passwordHash }, tx)

    return userRepo.update(validatedToken.userId, { status }, tx)
  })

  const [team, permissions] = await Promise.all([
    resolveUserTeam(user.id),
    resolvePermissionList(user.id)
  ])

  const [accessToken, refreshToken] = await createAuthTokens(
    user,
    deviceInfo,
    permissions
  )

  return {
    data: { user, team, permissions, accessToken },
    refreshToken
  }
}
