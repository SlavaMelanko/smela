import { useCurrentUser } from '@ui/hooks/useAuth'

export const useHasAccess = ({
  requireStatuses = [],
  requireRoles = [],
  requirePermissions = [],
  requireTeamPermissions = []
} = {}) => {
  const {
    isPending,
    isAuthenticated,
    user: me,
    canAll,
    canAllInTeam
  } = useCurrentUser()

  const hasRequiredStatus =
    requireStatuses.length === 0 || requireStatuses.includes(me?.status)

  const hasRequiredRole =
    requireRoles.length === 0 || requireRoles.includes(me?.role)

  const hasRequiredPermissions =
    requirePermissions.length === 0 || canAll(requirePermissions)

  const hasRequiredTeamPermissions =
    requireTeamPermissions.length === 0 || canAllInTeam(requireTeamPermissions)

  const hasAccess =
    isAuthenticated &&
    hasRequiredStatus &&
    hasRequiredRole &&
    hasRequiredPermissions &&
    hasRequiredTeamPermissions

  return { isPending, isAuthenticated, hasAccess }
}
