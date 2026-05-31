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
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useHashTab } from '@ui/hooks/useHashTab'
import { useLocale } from '@ui/hooks/useLocale'
import { useLocation, useParams } from '@ui/hooks/useRouter'

import { MembershipTab } from './MembershipTab'
import { PermissionsTab } from './PermissionsTab'
import { ProfileTab } from './ProfileTab'

export const UserPage = () => {
  const { id } = useParams()
  const { state } = useLocation()
  const { t } = useLocale()
  const { can } = useCurrentUser()

  const {
    data: user,
    isPending,
    isError,
    error,
    refetch
  } = useUser(id, {
    initialData: state?.user ? { user: state.user } : undefined
  })

  const canViewTeams = can('view:teams')
  const canManageTeams = can('manage:teams')

  const hasUserMembership = !isPending && !!user?.team

  const [activeTab, setActiveTab] = useHashTab(
    getUserTabValues(hasUserMembership, canManageTeams),
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
        <TabsLine tabs={getUserTabs(hasUserMembership, canManageTeams, t)} />
        <TabsContent value={Tab.PROFILE}>
          <ProfileTab user={user} />
        </TabsContent>
        {hasUserMembership && canViewTeams && (
          <TabsContent value={Tab.MEMBERSHIP}>
            <MembershipTab
              user={user}
              team={user?.team}
              canManageTeams={canManageTeams}
            />
          </TabsContent>
        )}
        {hasUserMembership && canManageTeams && (
          <TabsContent value={Tab.PERMISSIONS}>
            <PermissionsTab
              teamId={user?.team?.id}
              memberId={id}
              canManageTeams={canManageTeams}
            />
          </TabsContent>
        )}
      </Tabs>
    </PageContent>
  )
}
