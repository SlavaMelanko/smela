import { useCurrentUser } from '@ui/hooks/useAuth'

export const usePermissions = () => {
  const { permissions } = useCurrentUser()

  return {
    can: p => permissions.includes(p),
    canAll: perms => perms.every(p => permissions.includes(p))
  }
}
