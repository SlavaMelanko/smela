import { MembershipSection } from '@/components/profile'
import { useCurrentUser } from '@/hooks/useAuth'
import { useUpdateTeamMember } from '@/hooks/useTeam'

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
