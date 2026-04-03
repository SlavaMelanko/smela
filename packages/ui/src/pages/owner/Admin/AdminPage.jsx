import { useParams } from 'react-router-dom'

import { BackButton } from '@/components/buttons'
import { PageContent } from '@/components/PageContent'
import { UserPageHeader } from '@/components/PageHeader'
import {
  getAdminTabs,
  getAdminTabValues,
  ProfileTab as Tab
} from '@/components/profile'
import { Spinner } from '@/components/Spinner'
import { ErrorState } from '@/components/states'
import { Tabs, TabsContent, TabsLine } from '@/components/ui'
import { useHashTab } from '@/hooks/useHashTab'
import { useLocale } from '@/hooks/useLocale'
import { useAdmin } from '@/hooks/useOwner'

import { PermissionsTab } from './PermissionsTab'
import { ProfileTab } from './ProfileTab'

export const AdminPage = () => {
  const { id } = useParams()
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useHashTab(getAdminTabValues(), Tab.PROFILE)
  const { data: admin, isPending, isError, error, refetch } = useAdmin(id)

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (isPending && !admin) {
    return <Spinner />
  }

  return (
    <PageContent>
      <div className='flex'>
        <BackButton />
      </div>
      <UserPageHeader user={admin} />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsLine tabs={getAdminTabs(t)} />
        <TabsContent value={Tab.PROFILE}>
          <ProfileTab admin={admin} />
        </TabsContent>
        <TabsContent value={Tab.PERMISSIONS}>
          <PermissionsTab adminId={id} />
        </TabsContent>
      </Tabs>
    </PageContent>
  )
}
