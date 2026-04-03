import { useOutletContext } from 'react-router-dom'

import { TeamGeneralSection } from '@/components/team'

export const TeamGeneralPage = () => {
  const { team } = useOutletContext()

  return <TeamGeneralSection team={team} />
}
