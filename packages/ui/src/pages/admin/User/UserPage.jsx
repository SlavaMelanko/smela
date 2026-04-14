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
import { useUser } from '@ui/hooks/useAdmin'
import { useHashTab } from '@ui/hooks/useHashTab'
import { useLocale } from '@ui/hooks/useLocale'
import { useLocation, useParams } from '@ui/hooks/useRouter'

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
