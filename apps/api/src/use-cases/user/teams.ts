import { db, teamRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { getMemberFullPermissions, MembershipStatus } from '@/types'

import { resolveUserTeams } from '../resolve-team'

export interface CreateTeamInput {
  name: string
  website: string
  description?: string
}

export interface UpdateTeamInput {
  name?: string
  website?: string
  description?: string | null
}

export const createTeam = async (userId: string, input: CreateTeamInput) => {
  const team = await db.transaction(async tx => {
    const newTeam = await teamRepo.create({ ...input, createdBy: userId }, tx)

    const membership = await teamRepo.createMember(
      { userId, teamId: newTeam.id, status: MembershipStatus.Active },
      tx
    )

    await teamRepo.setMemberPermissions(
      membership.id,
      getMemberFullPermissions(),
      tx
    )

    return newTeam
  })

  return { team }
}

export const updateTeam = async (teamId: string, updates: UpdateTeamInput) => {
  const team = await teamRepo.update(teamId, updates)

  return { team }
}

export const acceptTeamInvite = async (userId: string, teamId: string) => {
  const membership = await teamRepo.activateMember(userId, teamId)

  if (!membership) {
    throw new AppError(ErrorCode.NotFound, 'Invite not found')
  }

  return resolveUserTeams(userId)
}

export const declineTeamInvite = async (userId: string, teamId: string) => {
  const membership = await teamRepo.deletePendingMember(userId, teamId)

  if (!membership) {
    throw new AppError(ErrorCode.NotFound, 'Invite not found')
  }

  return resolveUserTeams(userId)
}

export const switchTeam = async (userId: string, teamId: string) => {
  const membership = await teamRepo.markMemberLastActive(userId, teamId)

  if (!membership) {
    throw new AppError(ErrorCode.Forbidden, 'Access denied to team')
  }

  return resolveUserTeams(userId)
}
