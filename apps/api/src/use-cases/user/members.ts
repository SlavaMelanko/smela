import type { PermissionsInput } from '@/types'

import { db, teamRepo, userRepo } from '@/data'
import { getMemberBasePermissions, UserStatus } from '@/types'
import { resolveMemberPermissionMap } from '@/use-cases/resolve-permissions'

export const getTeamMembers = async (teamId: string) => {
  const members = await teamRepo.findMembers(teamId)

  return { members }
}

export interface UpdateTeamMemberInput {
  membership?: {
    position?: string | null
  }
  member?: {
    firstName?: string
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
    updates.push(teamRepo.updateMember(memberId, teamId, input.membership))
  }

  if (input.member) {
    updates.push(userRepo.update(memberId, input.member))
  }

  await Promise.all(updates)

  const member = await teamRepo.findMember(teamId, memberId)

  return { member }
}

export const getTeamMemberPermissions = async (membershipId: string) => {
  const permissions = await resolveMemberPermissionMap(
    membershipId,
    getMemberBasePermissions()
  )

  return { permissions }
}

export const updateTeamMemberPermissions = async (
  membershipId: string,
  permissions: PermissionsInput
) => {
  await teamRepo.setMemberPermissions(membershipId, permissions)

  return getTeamMemberPermissions(membershipId)
}

export const removeTeamMember = async (teamId: string, memberId: string) => {
  await db.transaction(async tx => {
    await teamRepo.deleteMember(memberId, teamId, tx)
    await userRepo.update(memberId, { status: UserStatus.Archived }, tx)
  })

  return { success: true }
}
