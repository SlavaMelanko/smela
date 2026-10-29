import { PageContent } from '@ui/components/PageContent'
import { TeamPageHeader } from '@ui/components/PageHeader'
import { Spinner } from '@ui/components/Spinner'
import { ErrorState } from '@ui/components/states'
import { getTeamTabs, TeamTab } from '@ui/components/team'
import { Tabs, TabsLine } from '@ui/components/ui'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useLeaveTeam } from '@ui/hooks/useLeaveTeam'
import { useLocale } from '@ui/hooks/useLocale'
import { Navigate, Outlet, useLocation, useNavigate } from '@ui/hooks/useRouter'
import { userTeamQueryOptions, useTeam } from '@ui/hooks/useTeam'
import { canLeaveTeam } from '@ui/lib/team'

// Handles /team/general AND /team/members/:id — index 1 is always the tab segment
const getActiveTab = pathname => {
  const segment = pathname.split('/').filter(Boolean)[1]

  return Object.values(TeamTab).includes(segment) ? segment : TeamTab.GENERAL
}

export const TeamLayout = () => {
  const { user: me, team: myTeam } = useCurrentUser()
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
  const { handleLeaveTeam, isLeaving } = useLeaveTeam(myTeam?.id, me?.id)

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
      <TeamPageHeader
        id={team.id}
        name={team.name}
        website={team.website}
        onLeave={canLeaveTeam(me, team.creator) ? handleLeaveTeam : undefined}
        isLeaving={isLeaving}
      />
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
