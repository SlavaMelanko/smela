import { getAdminMenuItems, getUserMenuItems } from '@ui/components/Sidebar'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { isAdmin, isUser } from '@ui/lib/types'

export const useSidebarMenu = () => {
  const { user: me, team, permissions } = useCurrentUser()

  let items = []

  if (isUser(me?.role)) {
    items = getUserMenuItems()
  } else if (isAdmin(me?.role)) {
    const canViewTeams = permissions?.includes('view:teams') ?? false
    const canViewAdmins = permissions?.includes('view:admins') ?? false

    items = getAdminMenuItems({ canViewTeams, canViewAdmins })
  }

  return { items, team }
}
