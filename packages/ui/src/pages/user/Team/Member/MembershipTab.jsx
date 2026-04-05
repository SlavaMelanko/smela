import { MembershipSection } from '@ui/components/profile'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useUpdateTeamMember } from '@ui/hooks/useTeam'

export const MembershipTab = ({ team, member }) => {
  const { user: me } = useCurrentUser()
  const { mutate, isPending: isUpdating } = useUpdateTeamMember(
    team?.id,
    member?.id,
    me?.id
  )
  const update = (data, options) => mutate({ membership: data }, options)

  return (
    <MembershipSection
      member={member}
      team={team}
      teamLink='/team/general'
      update={update}
      isUpdating={isUpdating}
    />
  )
}
