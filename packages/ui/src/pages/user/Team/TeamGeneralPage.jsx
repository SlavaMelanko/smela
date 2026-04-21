import { TeamGeneralSection } from '@ui/components/team'
import { useOutletContext } from '@ui/hooks/useRouter'

export const TeamGeneralPage = () => {
  const { team } = useOutletContext()

  return <TeamGeneralSection team={team} />
}
