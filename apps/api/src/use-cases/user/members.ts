import type { Database } from '@/data'
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

// Platform admins bypass creator protection. Other members can't change the active creator
const lockChangeableMember = async (
  teamId: string,
  memberId: string,
  actorRole: Role,
  creatorError: string,
  tx: Database
) => {
  const member = await teamRepo.lockMembership(teamId, memberId, tx)
  if (!member) {
    throw new AppError(ErrorCode.NotFound, 'Member not found')
  }

  if (
    !isAdmin(actorRole) &&
    member.status === MembershipStatus.Active &&
    member.userId === member.createdBy
  ) {
    throw new AppError(ErrorCode.Forbidden, creatorError)
  }

  return member
}

export const updateTeamMemberPermissions = async (
  teamId: string,
  memberId: string,
  actorRole: Role,
  permissions: PermissionsInput
) => {
  const membershipId = await db.transaction(async tx => {
    const member = await lockChangeableMember(
      teamId,
      memberId,
      actorRole,
      'Cannot edit the team creator permissions',
      tx
    )

    await teamRepo.setMembershipPermissions(
      member.membershipId,
      permissions,
      tx
    )

    return member.membershipId
  })

  return getTeamMemberPermissions(membershipId)
}

// Removes only the membership. The account and other memberships stay intact
export const removeTeamMember = async (
  teamId: string,
  memberId: string,
  actorRole: Role
) => {
  await db.transaction(async tx => {
    const member = await lockChangeableMember(
      teamId,
      memberId,
      actorRole,
      'Cannot remove the team creator',
      tx
    )

    await teamRepo.deleteMembership(member.userId, teamId, tx)
  })

  return { success: true }
}
