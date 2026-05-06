import { MembershipSection } from '@ui/components/profile'
import { useTeamMember, useUpdateTeamMember } from '@ui/hooks/useTeam'

export const MembershipTab = ({ user, team, canManageTeams = true }) => {
  const { data: member } = useTeamMember(team.id, user.id)
  const { mutate, isPending: isUpdating } = useUpdateTeamMember(
    team.id,
    user.id
  )
  const update = (data, options) => mutate({ membership: data }, options)

  return (
    <MembershipSection
      member={member}
      team={team}
      teamLink={`/teams/${team.id}`}
      update={update}
      isUpdating={isUpdating}
      canManageTeams={canManageTeams}
    />
  )
}
