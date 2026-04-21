import { PageContent } from '@ui/components/PageContent'
import { ProfilePageHeader } from '@ui/components/PageHeader'
import {
  getProfileTabs,
  getProfileTabValues,
  ProfileTab as Tab
} from '@ui/components/profile'
import { Spinner } from '@ui/components/Spinner'
import { ErrorState } from '@ui/components/states'
import { Tabs, TabsContent, TabsLine } from '@ui/components/ui'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useHashTab } from '@ui/hooks/useHashTab'
import { useLocale } from '@ui/hooks/useLocale'

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
