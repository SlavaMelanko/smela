import { TeamMembersSection } from '@ui/components/team'
import { useNavigate, useOutletContext } from '@ui/hooks/useRouter'
import { userTeamQueryOptions } from '@ui/hooks/useTeam'

export const TeamMembersPage = () => {
  const { team } = useOutletContext()
  const navigate = useNavigate()

  return (
    <TeamMembersSection
      teamId={team.id}
      onRowClick={member =>
        navigate(`/team/members/${member.id}`, { state: { member } })
      }
      queryOptions={userTeamQueryOptions}
    />
  )
}
