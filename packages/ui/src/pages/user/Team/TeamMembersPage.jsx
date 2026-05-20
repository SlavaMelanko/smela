import { TeamMembersSection } from '@ui/components/team'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useNavigate, useOutletContext } from '@ui/hooks/useRouter'
import { userTeamQueryOptions } from '@ui/hooks/useTeam'

export const TeamMembersPage = () => {
  const { team } = useOutletContext()
  const navigate = useNavigate()
  const { can } = useCurrentUser()

  const canManageTeams = can('manage:teams')

  return (
    <TeamMembersSection
      teamId={team.id}
      canManageTeams={canManageTeams}
      onRowClick={member =>
        navigate(`/team/members/${member.id}`, { state: { member } })
      }
      queryOptions={userTeamQueryOptions}
    />
  )
}
