import type { TeamMemberDetails, TeamWithMemberCount } from '@/data'
import type { PermissionsInput, Role } from '@/types'

import { teamRepo, userRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { getMemberBasePermissions, isAdmin, MembershipStatus } from '@/types'
import { resolveMembershipPermissionMap } from '@/use-cases/resolve-permissions'

// Platform admins bypass creator protection. Other members can't change the active creator
const isProtectedCreator = (
  team: TeamWithMemberCount,
  member: TeamMemberDetails,
  role: Role
) =>
  !isAdmin(role) &&
  member.status === MembershipStatus.Active &&
  member.id === team.creator?.id

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
  team: TeamWithMemberCount,
  member: TeamMemberDetails,
  role: Role,
  permissions: PermissionsInput
) => {
  if (isProtectedCreator(team, member, role)) {
    throw new AppError(
      ErrorCode.Forbidden,
      'Cannot edit the team creator permissions'
    )
  }

  await teamRepo.setMembershipPermissions(member.membershipId, permissions)

  return getTeamMemberPermissions(member.membershipId)
}

// Removes only the membership. The account and other memberships stay intact
export const removeTeamMember = async (
  team: TeamWithMemberCount,
  member: TeamMemberDetails,
  role: Role
) => {
  if (isProtectedCreator(team, member, role)) {
    throw new AppError(ErrorCode.Forbidden, 'Cannot remove the team creator')
  }

  await teamRepo.deleteMembership(member.id, team.id)

  return { success: true }
}
