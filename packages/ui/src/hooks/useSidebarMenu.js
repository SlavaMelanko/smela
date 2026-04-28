import { getAdminMenuItems, getUserMenuItems } from '@ui/components/Sidebar'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { isAdmin, isUser } from '@ui/lib/types'

export const useSidebarMenu = () => {
  const { user: me, team, can } = useCurrentUser()

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
