import { getAdminMenuItems, getUserMenuItems } from '@ui/components/Sidebar'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { isAdmin, isUser } from '@ui/lib/types'

const filterByPermission = (items, can) =>
  items.filter(item => !item.permission || can(item.permission))

export const useSidebarMenu = () => {
  const { user: me, team, can } = useCurrentUser()

  let items = []
  let teams

  if (isUser(me?.role)) {
    items = getUserMenuItems()
    teams = team ? [team] : []
  } else if (isAdmin(me?.role)) {
    items = filterByPermission(getAdminMenuItems(), can)
  }

  return { items, teams }
}
