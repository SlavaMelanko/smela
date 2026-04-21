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
import { ProfileTab } from './ProfileTab'

export const TeamMemberPage = () => {
  const { id } = useParams()
  const { state } = useLocation()
  const { team: myTeam } = useCurrentUser()
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

  const [activeTab, setActiveTab] = useHashTab(
    getUserTabValues(true),
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
        <TabsLine tabs={getUserTabs(true, t)} />
        <TabsContent value={Tab.PROFILE}>
          <ProfileTab member={member} team={myTeam} />
        </TabsContent>
        <TabsContent value={Tab.MEMBERSHIP}>
          <MembershipTab member={member} team={myTeam} />
        </TabsContent>
      </Tabs>
    </PageContent>
  )
}
