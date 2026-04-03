import { menuByRole, userMenuItems } from '@/components/Sidebar'
import { useCurrentUser } from '@/hooks/useAuth'

export const useSidebarMenu = () => {
  const { user: me, team } = useCurrentUser()

  const items = me?.role ? (menuByRole[me.role] ?? userMenuItems) : []

  return { items, team }
}
