import type { TeamMemberDetails, TeamWithMemberCount } from '@/data'
import type { PermissionsInput, Role } from '@/types'

import { teamRepo, userRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { getMemberBasePermissions, isAdmin, MembershipStatus } from '@/types'
import { resolveMembershipPermissionMap } from '@/use-cases/resolve-permissions'

import { resolveNickname } from '../resolve-nickname'

// Platform admins bypass creator protection. Other members can't change the active creator
const isProtectedCreator = (
  team: TeamWithMemberCount,
  member: TeamMemberDetails,
  role: Role
) =>
  !isAdmin(role) &&
  member.status === MembershipStatus.Active &&
  member.id === team.creator?.id

// A pending invitee never accepted, so an existing account's profile and
// activity stay private. Same placeholder as a freshly invited account.
// Platform admins see everything
const maskPendingMember = (
  member: TeamMemberDetails,
  role: Role
): TeamMemberDetails =>
  isAdmin(role) || member.status !== MembershipStatus.Pending
    ? member
    : {
        ...member,
        nickname: resolveNickname(member.email),
        firstName: null,
        lastName: null,
        lastActive: null
      }

export const getTeamMembers = async (teamId: string, role: Role) => {
  const members = await teamRepo.findMembers(teamId)

  return { members: members.map(member => maskPendingMember(member, role)) }
}

export const getTeamMember = (member: TeamMemberDetails, role: Role) => ({
  member: maskPendingMember(member, role)
})

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
