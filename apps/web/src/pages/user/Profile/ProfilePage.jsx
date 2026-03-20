import { PageContent } from '@/components/PageContent'
import { ProfilePageHeader } from '@/components/PageHeader'
import {
  getProfileTabs,
  getProfileTabValues,
  ProfileTab as Tab
} from '@/components/profile'
import { Spinner } from '@/components/Spinner'
import { ErrorState } from '@/components/states'
import { Tabs, TabsContent, TabsLine } from '@/components/ui'
import { useCurrentUser } from '@/hooks/useAuth'
import { useHashTab } from '@/hooks/useHashTab'
import { useLocale } from '@/hooks/useLocale'

import { ProfileTab } from './ProfileTab'
import { SecurityTab } from './SecurityTab'

export const ProfilePage = () => {
  const { t } = useLocale()
  const { user: me, isPending, isError, error } = useCurrentUser()

  const [activeTab, setActiveTab] = useHashTab(
    getProfileTabValues(),
    Tab.GENERAL
  )

  if (isError) {
    return <ErrorState error={error} />
  }

  if (isPending && !me) {
    return <Spinner />
  }

  return (
    <PageContent>
      <ProfilePageHeader user={me} />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsLine tabs={getProfileTabs(t)} />
        <TabsContent value={Tab.GENERAL}>
          <ProfileTab user={me} />
        </TabsContent>
        <TabsContent value={Tab.SECURITY}>
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </PageContent>
  )
}
