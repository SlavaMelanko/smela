import { TeamGeneralSection } from '@ui/components/team'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useOutletContext } from '@ui/hooks/useRouter'

export const TeamGeneralPage = () => {
  const { team } = useOutletContext()
  const { can } = useCurrentUser()

  const canManageTeams = can('manage:teams')

  return <TeamGeneralSection team={team} canManageTeams={canManageTeams} />
}
