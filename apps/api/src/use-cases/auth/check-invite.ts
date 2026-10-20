import { teamRepo } from '@/data'
import { env } from '@/env'
import { AppError, ErrorCode } from '@/errors'
import { InviteKind, TokenType } from '@/security/token'

import { readInviteMetadata, validateOneTimeToken } from '../tokens'

interface CheckInviteResult {
  kind: InviteKind
  teamName: string
}

export const checkInvite = async (
  token: string
): Promise<CheckInviteResult> => {
  const validatedToken = await validateOneTimeToken(token, TokenType.UserInvite)
  const metadata = readInviteMetadata(validatedToken.metadata)

  if (metadata.kind === InviteKind.Admin) {
    return { kind: metadata.kind, teamName: env.COMPANY_NAME }
  }

  const team = await teamRepo.findById(metadata.teamId)
  if (!team) {
    throw new AppError(ErrorCode.TokenDeprecated, 'Invalid invite')
  }

  return { kind: metadata.kind, teamName: team.name }
}
