import { TeamMembersSection } from '@ui/components/team'
import { userTeamQueryOptions } from '@ui/hooks/useTeam'
import { useNavigate, useOutletContext } from 'react-router-dom'

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
