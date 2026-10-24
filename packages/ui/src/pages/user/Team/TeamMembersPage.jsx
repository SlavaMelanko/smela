import { TeamMembersSection } from '@ui/components/team'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useNavigate, useOutletContext } from '@ui/hooks/useRouter'
import { userTeamQueryOptions } from '@ui/hooks/useTeam'

export const TeamMembersPage = () => {
  const { team } = useOutletContext()
  const navigate = useNavigate()
  const { canInTeam } = useCurrentUser()

  const canManageTeams = canInTeam('manage:teams')

  return (
    <TeamMembersSection
      teamId={team.id}
      canManageTeams={canManageTeams}
      // Platform admins can remove the creator, so only the user app protects them
      protectedCreatorId={team.creator?.id}
      onRowClick={member =>
        navigate(`/team/members/${member.id}`, { state: { member } })
      }
      queryOptions={userTeamQueryOptions}
    />
  )
}
