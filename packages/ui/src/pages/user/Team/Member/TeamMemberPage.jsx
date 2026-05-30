import { BackButton } from '@ui/components/buttons'
import { PageContent } from '@ui/components/PageContent'
import { UserPageHeader } from '@ui/components/PageHeader'
import {
  getUserTabs,
  getUserTabValues,
  ProfileTab as Tab
} from '@ui/components/profile'
import { Spinner } from '@ui/components/Spinner'
import { ErrorState } from '@ui/components/states'
import { Tabs, TabsContent, TabsLine } from '@ui/components/ui'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useHashTab } from '@ui/hooks/useHashTab'
import { useLocale } from '@ui/hooks/useLocale'
import { Navigate, useLocation, useParams } from '@ui/hooks/useRouter'
import { userTeamQueryOptions, useTeamMember } from '@ui/hooks/useTeam'

import { MembershipTab } from './MembershipTab'
import { PermissionsTab } from './PermissionsTab'
import { ProfileTab } from './ProfileTab'

export const TeamMemberPage = () => {
  const { id } = useParams()
  const { state } = useLocation()
  const { user: me, team: myTeam, can } = useCurrentUser()
  const { t } = useLocale()

  const {
    data: member,
    isPending,
    isError,
    error,
    refetch
  } = useTeamMember(myTeam?.id, id, {
    ...userTeamQueryOptions,
    initialData: state?.member ? { member: state.member } : undefined
  })

  const isOwnProfile = me?.id === id
  const canManageTeams = can('manage:teams') && !isOwnProfile

  const [activeTab, setActiveTab] = useHashTab(
    getUserTabValues(true, canManageTeams),
    Tab.PROFILE
  )

  if (!myTeam) {
    return <Navigate to='/not-found' replace />
  }

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (isPending && !member) {
    return <Spinner />
  }

  return (
    <PageContent>
      <div className='flex'>
        <BackButton />
      </div>
      <UserPageHeader user={member} />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsLine tabs={getUserTabs(true, canManageTeams, t)} />
        <TabsContent value={Tab.PROFILE}>
          <ProfileTab member={member} team={myTeam} />
        </TabsContent>
        <TabsContent value={Tab.MEMBERSHIP}>
          <MembershipTab member={member} team={myTeam} />
        </TabsContent>
        {canManageTeams && (
          <TabsContent value={Tab.PERMISSIONS}>
            <PermissionsTab
              teamId={myTeam.id}
              memberId={id}
              canManageTeams={canManageTeams}
            />
          </TabsContent>
        )}
      </Tabs>
    </PageContent>
  )
}
