import { useCurrentUser } from '@ui/hooks/useAuth'

export const useHasAccess = ({
  requireStatuses = [],
  requireRoles = [],
  requirePermissions = []
} = {}) => {
  const { isFetching, isAuthenticated, user: me, canAll } = useCurrentUser()

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
