import { MembershipSection } from '@ui/components/profile'
import { useUpdateTeamMember } from '@ui/hooks/useTeam'

export const MembershipTab = ({ team, member, canManageTeams = false }) => {
  const { mutate, isPending: isUpdating } = useUpdateTeamMember(
    team?.id,
    member?.id
  )

  const update = (data, options) => mutate({ membership: data }, options)

  return (
    <MembershipSection
      member={member}
      team={team}
      teamLink='/team/general'
      update={update}
      isUpdating={isUpdating}
      canManageTeams={canManageTeams}
    />
  )
}
