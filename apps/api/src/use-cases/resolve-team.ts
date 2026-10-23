import { teamRepo } from '@/data'

import { resolveMembershipPermissionList } from './resolve-permissions'

// The active team comes with its permissions. The rest feed the team switcher,
// and invites are the teams the user hasn't joined yet
export const resolveUserTeams = async (userId: string) => {
  const [memberships, invites] = await Promise.all([
    teamRepo.findUserTeams(userId),
    teamRepo.findUserInvites(userId)
  ])
  const teams = memberships.map(({ membershipId, ...info }) => info)

  const [active] = memberships

  if (!active) {
    return { team: undefined, teams, invites }
  }

  const permissions = await resolveMembershipPermissionList(active.membershipId)

  return { team: { ...teams[0], permissions }, teams, invites }
}
