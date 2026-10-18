import { rbacRepo, teamRepo } from '@/data'
import { env } from '@/env'
import { AppError, ErrorCode } from '@/errors'
import { TokenType } from '@/security/token'
import { Role } from '@/types'

import { validateOneTimeToken } from '../tokens'

type InviteType = 'member' | 'admin'

interface CheckInviteResult {
  type: InviteType
  teamName: string
}

const checkMemberInvite = async (
  userId: string
): Promise<CheckInviteResult | null> => {
  const userTeam = await teamRepo.findUserTeam(userId)

  if (!userTeam) {
    return null
  }

  return { type: 'member', teamName: userTeam.name }
}

const checkAdminInvite = async (
  userId: string
): Promise<CheckInviteResult | null> => {
  const userRole = await rbacRepo.findRole(userId)

  if (userRole?.role !== Role.Admin) {
    return null
  }

  return { type: 'admin', teamName: env.COMPANY_NAME }
}

export const checkInvite = async (
  token: string
): Promise<CheckInviteResult> => {
  const validatedToken = await validateOneTimeToken(token, TokenType.UserInvite)

  const memberInvite = await checkMemberInvite(validatedToken.userId)
  if (memberInvite) {
    return memberInvite
  }

  const adminInvite = await checkAdminInvite(validatedToken.userId)
  if (adminInvite) {
    return adminInvite
  }

  throw new AppError(ErrorCode.TokenDeprecated, 'Invalid invite')
}
