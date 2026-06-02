import { Spinner } from '@ui/components/Spinner'
import { useHasAccess } from '@ui/hooks/useHasAccess'
import { Navigate } from '@ui/hooks/useRouter'
import { ErrorLayout } from '@ui/layouts'
import { ForbiddenErrorPage } from '@ui/pages/errors'

export const PrivateRoute = ({
  children,
  requireStatuses = [],
  requireRoles = [],
  requirePermissions = []
}) => {
  const { isFetching, isAuthenticated, hasAccess } = useHasAccess({
    requireStatuses,
    requireRoles,
    requirePermissions
  })

  if (isFetching) {
    return <Spinner />
  }

  if (!isAuthenticated) {
    return <Navigate to='/' replace />
  }

  if (!hasAccess) {
    return (
      <ErrorLayout>
        <ForbiddenErrorPage />
      </ErrorLayout>
    )
  }

  return children
}
