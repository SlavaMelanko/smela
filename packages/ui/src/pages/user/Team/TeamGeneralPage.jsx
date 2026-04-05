import { TeamGeneralSection } from '@ui/components/team'
import { useOutletContext } from 'react-router-dom'

export const TeamGeneralPage = () => {
  const { team } = useOutletContext()

  return <TeamGeneralSection team={team} />
}
