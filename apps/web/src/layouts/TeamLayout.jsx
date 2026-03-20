import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { BackButton } from '@/components/buttons'
import { PageContent } from '@/components/PageContent'
import { TeamPageHeader } from '@/components/PageHeader'
import { Spinner } from '@/components/Spinner'
import { ErrorState } from '@/components/states'
import { getTeamTabs, TeamTab } from '@/components/team'
import { Tabs, TabsLine } from '@/components/ui'
import { useCurrentUser } from '@/hooks/useAuth'
import { useLocale } from '@/hooks/useLocale'
import { userTeamQueryOptions, useTeam } from '@/hooks/useTeam'

// Handles /team/general AND /team/members/:id — index 1 is always the tab segment
const getActiveTab = pathname => {
  const segment = pathname.split('/').filter(Boolean)[1]

  return Object.values(TeamTab).includes(segment) ? segment : TeamTab.GENERAL
}

export const TeamLayout = () => {
  const { team: myTeam } = useCurrentUser()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLocale()

  const {
    data: team,
    isPending,
    isError,
    error,
    refetch
  } = useTeam(myTeam?.id, userTeamQueryOptions)

  if (!myTeam) {
    return <Navigate to='/not-found' replace />
  }

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (isPending && !team) {
    return <Spinner />
  }

  return (
    <PageContent>
      <div className='flex'>
        <BackButton />
      </div>
      <TeamPageHeader name={team.name} website={team.website} />
      <Tabs
        value={getActiveTab(location.pathname)}
        onValueChange={value => navigate(`/team/${value}`)}
      >
        <TabsLine tabs={getTeamTabs(team, t)} />
        <Outlet context={{ team }} />
      </Tabs>
    </PageContent>
  )
}
