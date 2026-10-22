import { MembershipSection } from '@ui/components/profile'
import { useTeam, useTeamMember, useUpdateTeamMember } from '@ui/hooks/useTeam'

export const MembershipTab = ({ user, team, canManageTeams = false }) => {
  const { data: member } = useTeamMember(team.id, user.id)
  const { mutate, isPending: isUpdating } = useUpdateTeamMember(
    team.id,
    user.id
  )
  // Team details carry the creator; the user's team list does not
  const { data: teamDetails } = useTeam(team.id)
  const creator = teamDetails?.creator

  const update = (data, options) => mutate({ membership: data }, options)

  return (
    <MembershipSection
      member={member}
      team={team}
      teamLink={`/teams/${team.id}`}
      creator={creator}
      getMemberLink={id => `/users/${id}`}
      update={update}
      isUpdating={isUpdating}
      canManageTeams={canManageTeams}
    />
  )
}
