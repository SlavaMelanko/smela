import { getAdminMenuItems, getUserMenuItems } from '@ui/components/Sidebar'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { isAdmin, isUser } from '@ui/lib/types'

const filterByPermission = (items, can) =>
  items.filter(item => !item.permission || can(item.permission))

export const useSidebarMenu = () => {
  const { user: me, teams, can } = useCurrentUser()

  if (isUser(me?.role)) {
    return { items: getUserMenuItems(), teams }
  }

  if (isAdmin(me?.role)) {
    return { items: filterByPermission(getAdminMenuItems(), can) }
  }

  return { items: [] }
}
