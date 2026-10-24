import type { PermissionsInput, Role } from '@/types'

import { db, teamRepo, userRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { getMemberBasePermissions, isAdmin, MembershipStatus } from '@/types'
import { resolveMembershipPermissionMap } from '@/use-cases/resolve-permissions'

export const getTeamMembers = async (teamId: string) => {
  const members = await teamRepo.findMembers(teamId)

  return { members }
}

export interface UpdateTeamMemberInput {
  membership?: {
    position?: string | null
  }
  member?: {
    nickname?: string
    firstName?: string | null
    lastName?: string | null
  }
}

export const updateTeamMember = async (
  teamId: string,
  memberId: string,
  input: UpdateTeamMemberInput
) => {
  const updates: Array<Promise<unknown>> = []

  if (input.membership) {
    updates.push(teamRepo.updateMembership(memberId, teamId, input.membership))
  }

  if (input.member) {
    updates.push(userRepo.update(memberId, input.member))
  }

  await Promise.all(updates)

  const member = await teamRepo.findMember(teamId, memberId)

  return { member }
}

export const getTeamMemberPermissions = async (membershipId: string) => {
  const permissions = await resolveMembershipPermissionMap(
    membershipId,
    getMemberBasePermissions()
  )

  return { permissions }
}

export const updateTeamMemberPermissions = async (
  membershipId: string,
  permissions: PermissionsInput
) => {
  await teamRepo.setMembershipPermissions(membershipId, permissions)

  return getTeamMemberPermissions(membershipId)
}

// Removes only the membership. The account and other memberships stay intact
export const removeTeamMember = async (
  teamId: string,
  memberId: string,
  actorRole: Role
) => {
  await db.transaction(async tx => {
    const member = await teamRepo.lockMembershipForRemoval(teamId, memberId, tx)
    if (!member) {
      throw new AppError(ErrorCode.NotFound, 'Member not found')
    }

    if (
      !isAdmin(actorRole) &&
      member.status === MembershipStatus.Active &&
      member.userId === member.createdBy
    ) {
      throw new AppError(ErrorCode.Forbidden, 'Cannot remove the team creator')
    }

    await teamRepo.deleteMembership(member.userId, teamId, tx)
  })

  return { success: true }
}
