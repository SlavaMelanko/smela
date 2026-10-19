import { teamRepo } from '@/data'

import { resolveMemberPermissionList } from './resolve-permissions'

export const resolveUserTeam = async (userId: string) => {
  const team = await teamRepo.findUserTeam(userId)

  if (!team) {
    return undefined
  }

  const { membershipId, ...info } = team
  const permissions = await resolveMemberPermissionList(membershipId)

  return { ...info, permissions }
}
