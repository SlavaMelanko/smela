import { BackButton } from '@ui/components/buttons'
import { PageContent } from '@ui/components/PageContent'
import { TeamPageHeader } from '@ui/components/PageHeader'
import { Spinner } from '@ui/components/Spinner'
import { ErrorState } from '@ui/components/states'
import {
  getTeamTabs,
  TeamGeneralSection,
  TeamMembersSection,
  TeamTab
} from '@ui/components/team'
import { Tabs, TabsContent, TabsLine } from '@ui/components/ui'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useHashTab } from '@ui/hooks/useHashTab'
import { useLocale } from '@ui/hooks/useLocale'
import { useLocation, useNavigate, useParams } from '@ui/hooks/useRouter'
import { useTeam } from '@ui/hooks/useTeam'

export const TeamPage = () => {
  const { id: teamId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { t } = useLocale()
  const { can } = useCurrentUser()
  const [activeTab, setActiveTab] = useHashTab(
    Object.values(TeamTab),
    TeamTab.GENERAL
  )

  const readOnly = !can('manage:teams')

  const {
    data: team,
    isPending,
    isError,
    error,
    refetch
  } = useTeam(teamId, {
    initialData: state?.team ? { team: state.team } : undefined
  })

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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsLine tabs={getTeamTabs(team, t)} />
        <TabsContent value={TeamTab.GENERAL}>
          <TeamGeneralSection team={team} readOnly={readOnly} />
        </TabsContent>
        <TabsContent value={TeamTab.MEMBERS}>
          <TeamMembersSection
            teamId={teamId}
            readOnly={readOnly}
            onRowClick={member =>
              navigate(`/users/${member.id}`, { state: { user: member } })
            }
          />
        </TabsContent>
      </Tabs>
    </PageContent>
  )
}
