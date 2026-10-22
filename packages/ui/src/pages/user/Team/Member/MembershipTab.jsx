import { MembershipSection } from '@ui/components/profile'
import {
  userTeamQueryOptions,
  useTeam,
  useUpdateTeamMember
} from '@ui/hooks/useTeam'

export const MembershipTab = ({ team, member, canManageTeams = false }) => {
  const { mutate, isPending: isUpdating } = useUpdateTeamMember(
    team?.id,
    member?.id
  )

  // Team details carry the creator; the team in auth context does not
  const { data: teamDetails } = useTeam(team?.id, userTeamQueryOptions)
  const creator = teamDetails?.creator

  const update = (data, options) => mutate({ membership: data }, options)

  return (
    <MembershipSection
      member={member}
      team={team}
      teamLink='/team/general'
      creator={creator}
      getMemberLink={id => `/team/members/${id}`}
      update={update}
      isUpdating={isUpdating}
      canManageTeams={canManageTeams}
    />
  )
}
