import { useCurrentUser } from '@ui/hooks/useAuth'
import { usePermissions } from '@ui/hooks/usePermissions'

export const useHasAccess = ({
  requireStatuses = [],
  requireRoles = [],
  requirePermissions = []
} = {}) => {
  const { isFetching, isAuthenticated, user: me } = useCurrentUser()
  const { canAll } = usePermissions()

  const hasRequiredStatus =
    requireStatuses.length === 0 || requireStatuses.includes(me?.status)

  const hasRequiredRole =
    requireRoles.length === 0 || requireRoles.includes(me?.role)

  const hasRequiredPermissions =
    requirePermissions.length === 0 || canAll(requirePermissions)

  const hasAccess =
    isAuthenticated &&
    hasRequiredStatus &&
    hasRequiredRole &&
    hasRequiredPermissions

  return { isFetching, isAuthenticated, hasAccess }
}
