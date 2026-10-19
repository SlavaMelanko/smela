import { teamRepo } from '@/data'

import { resolveMemberPermissionList } from './resolve-permissions'

// The active team comes with its permissions. The rest feed the team switcher
export const resolveUserTeams = async (userId: string) => {
  const memberships = await teamRepo.findUserTeams(userId)
  const teams = memberships.map(({ membershipId, ...info }) => info)

  const [active] = memberships

  if (!active) {
    return { team: undefined, teams }
  }

  const permissions = await resolveMemberPermissionList(active.membershipId)

  return { team: { ...teams[0], permissions }, teams }
}
