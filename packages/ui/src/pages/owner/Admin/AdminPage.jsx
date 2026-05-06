import { BackButton } from '@ui/components/buttons'
import { PageContent } from '@ui/components/PageContent'
import { UserPageHeader } from '@ui/components/PageHeader'
import {
  getAdminTabs,
  getAdminTabValues,
  ProfileTab as Tab
} from '@ui/components/profile'
import { Spinner } from '@ui/components/Spinner'
import { ErrorState } from '@ui/components/states'
import { Tabs, TabsContent, TabsLine } from '@ui/components/ui'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useHashTab } from '@ui/hooks/useHashTab'
import { useLocale } from '@ui/hooks/useLocale'
import { useAdmin } from '@ui/hooks/useOwner'
import { useParams } from '@ui/hooks/useRouter'

import { PermissionsTab } from './PermissionsTab'
import { ProfileTab } from './ProfileTab'

export const AdminPage = () => {
  const { id } = useParams()
  const { t } = useLocale()
  const { can } = useCurrentUser()
  const [activeTab, setActiveTab] = useHashTab(getAdminTabValues(), Tab.PROFILE)
  const { data: admin, isPending, isError, error, refetch } = useAdmin(id)

  const canManageAdmins = can('manage:admins')

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
          <ProfileTab admin={admin} canManageAdmins={canManageAdmins} />
        </TabsContent>
        <TabsContent value={Tab.PERMISSIONS}>
          <PermissionsTab adminId={id} canManageAdmins={canManageAdmins} />
        </TabsContent>
      </Tabs>
    </PageContent>
  )
}
