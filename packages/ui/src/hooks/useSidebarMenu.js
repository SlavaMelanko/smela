import { menuByRole, userMenuItems } from '@ui/components/Sidebar'
import { useCurrentUser } from '@ui/hooks/useAuth'

export const useSidebarMenu = () => {
  const { user: me, team } = useCurrentUser()

  const items = me?.role ? (menuByRole[me.role] ?? userMenuItems) : []

  return { items, team }
}
