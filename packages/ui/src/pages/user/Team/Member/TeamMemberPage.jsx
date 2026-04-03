import { Navigate, useLocation, useParams } from 'react-router-dom'

import { BackButton } from '@/components/buttons'
import { PageContent } from '@/components/PageContent'
import { UserPageHeader } from '@/components/PageHeader'
import {
  getUserTabs,
  getUserTabValues,
  ProfileTab as Tab
} from '@/components/profile'
import { Spinner } from '@/components/Spinner'
import { ErrorState } from '@/components/states'
import { Tabs, TabsContent, TabsLine } from '@/components/ui'
import { useCurrentUser } from '@/hooks/useAuth'
import { useHashTab } from '@/hooks/useHashTab'
import { useLocale } from '@/hooks/useLocale'
import { userTeamQueryOptions, useTeamMember } from '@/hooks/useTeam'

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
