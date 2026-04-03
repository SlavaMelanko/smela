import { useLocation, useParams } from 'react-router-dom'

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
import { useUser } from '@/hooks/useAdmin'
import { useHashTab } from '@/hooks/useHashTab'
import { useLocale } from '@/hooks/useLocale'

import { MembershipTab } from './MembershipTab'
import { ProfileTab } from './ProfileTab'

export const UserPage = () => {
  const { id } = useParams()
  const { state } = useLocation()
  const { t } = useLocale()
  const {
    data: user,
    isPending,
    isError,
    error,
    refetch
  } = useUser(id, {
    initialData: state?.user ? { user: state.user } : undefined
  })

  const hasMembership = !isPending && !!user?.team
  const [activeTab, setActiveTab] = useHashTab(
    getUserTabValues(hasMembership),
    Tab.PROFILE
  )

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (isPending && !user) {
    return <Spinner />
  }

  return (
    <PageContent>
      <div className='flex'>
        <BackButton />
      </div>
      <UserPageHeader user={user} />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsLine tabs={getUserTabs(hasMembership, t)} />
        <TabsContent value={Tab.PROFILE}>
          <ProfileTab user={user} />
        </TabsContent>
        {hasMembership && (
          <TabsContent value={Tab.MEMBERSHIP}>
            <MembershipTab user={user} team={user?.team} />
          </TabsContent>
        )}
      </Tabs>
    </PageContent>
  )
}
