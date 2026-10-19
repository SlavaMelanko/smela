import { TeamGeneralSection } from '@ui/components/team'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useOutletContext } from '@ui/hooks/useRouter'

export const TeamGeneralPage = () => {
  const { team } = useOutletContext()
  const { canInTeam } = useCurrentUser()

  const canManageTeams = canInTeam('manage:teams')

  return <TeamGeneralSection team={team} canManageTeams={canManageTeams} />
}
