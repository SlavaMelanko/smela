import { useNavigate, useOutletContext } from 'react-router-dom'

import { TeamMembersSection } from '@/components/team'
import { userTeamQueryOptions } from '@/hooks/useTeam'

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
