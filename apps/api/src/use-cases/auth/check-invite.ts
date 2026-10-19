import { teamRepo } from '@/data'
import { env } from '@/env'
import { AppError, ErrorCode } from '@/errors'
import { InviteKind, TokenType } from '@/security/token'

import { readInviteKind, validateOneTimeToken } from '../tokens'

interface CheckInviteResult {
  kind: InviteKind
  teamName: string
}

export const checkInvite = async (
  token: string
): Promise<CheckInviteResult> => {
  const validatedToken = await validateOneTimeToken(token, TokenType.UserInvite)
  const kind = readInviteKind(validatedToken.metadata)

  if (kind === InviteKind.Admin) {
    return { kind, teamName: env.COMPANY_NAME }
  }

  // A new invited user has exactly one team
  const [userTeam] = await teamRepo.findUserTeams(validatedToken.userId)
  if (!userTeam) {
    throw new AppError(ErrorCode.TokenDeprecated, 'Invalid invite')
  }

  return { kind, teamName: userTeam.name }
}
