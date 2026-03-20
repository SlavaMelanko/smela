import { useCurrentUser } from '@/hooks/useAuth'

export const useHasAccess = ({
  requireStatuses = [],
  requireRoles = []
} = {}) => {
  const { isFetching, isAuthenticated, user: me } = useCurrentUser()

  const hasRequiredStatus =
    requireStatuses.length === 0 || requireStatuses.includes(me?.status)

  const hasRequiredRole =
    requireRoles.length === 0 || requireRoles.includes(me?.role)

  const hasAccess = isAuthenticated && hasRequiredStatus && hasRequiredRole

  return {
    isFetching,
    isAuthenticated,
    hasAccess,
    status: me?.status || null,
    role: me?.role || null
  }
}
