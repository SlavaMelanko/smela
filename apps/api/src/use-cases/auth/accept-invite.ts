import type { Database } from '@/data'
import type { DeviceInfo } from '@/net/http/device'
import type { InviteMetadata } from '@/security/token'

import { authRepo, db, teamRepo, tokenRepo, userRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { hashPassword } from '@/security/password'
import { InviteKind, TokenStatus, TokenType } from '@/security/token'
import { UserStatus } from '@/types'

import { resolvePermissionList } from '../resolve-permissions'
import { resolveUserTeams } from '../resolve-team'
import {
  createAuthTokens,
  readInviteMetadata,
  validateOneTimeToken
} from '../tokens'

export interface AcceptInviteInput {
  token: string
  password: string
  nickname?: string
}

// The invite link proves the email like the verification link does.
// Admins need Active because the admin app accepts only that status
const resolveAcceptedStatus = (kind: InviteKind) =>
  kind === InviteKind.Admin ? UserStatus.Active : UserStatus.Verified

const joinInvitedTeam = async (
  userId: string,
  metadata: InviteMetadata,
  tx: Database
) => {
  if (metadata.kind !== InviteKind.Member) {
    return
  }

  const membership = await teamRepo.activateMember(userId, metadata.teamId, tx)
  if (!membership) {
    throw new AppError(ErrorCode.TokenDeprecated, 'Invalid invite')
  }
}

export const acceptInvite = async (
  { token, password, nickname }: AcceptInviteInput,
  deviceInfo: DeviceInfo
) => {
  const validatedToken = await validateOneTimeToken(token, TokenType.UserInvite)

  const metadata = readInviteMetadata(validatedToken.metadata)

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

    await joinInvitedTeam(validatedToken.userId, metadata, tx)

    return userRepo.update(
      validatedToken.userId,
      { status: resolveAcceptedStatus(metadata.kind), nickname },
      tx
    )
  })

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
