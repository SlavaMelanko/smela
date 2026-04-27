import { getAdminMenuItems, getUserMenuItems } from '@ui/components/Sidebar'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { usePermissions } from '@ui/hooks/usePermissions'
import { isAdmin, isUser } from '@ui/lib/types'

export const useSidebarMenu = () => {
  const { user: me, team } = useCurrentUser()
  const { can } = usePermissions()

  let items = []

  if (isUser(me?.role)) {
    items = getUserMenuItems()
  } else if (isAdmin(me?.role)) {
    items = getAdminMenuItems({
      canViewTeams: can('view:teams'),
      canViewAdmins: can('view:admins')
    })
  }

  return { items, team }
}
