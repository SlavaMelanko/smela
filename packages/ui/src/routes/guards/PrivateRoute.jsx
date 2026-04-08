import { Spinner } from '@ui/components/Spinner'
import { useHasAccess } from '@ui/hooks/useHasAccess'
import { ErrorLayout } from '@ui/layouts'
import { NotFoundErrorPage } from '@ui/pages/errors'
import { Navigate } from 'react-router-dom'

export const PrivateRoute = ({
  children,
  requireStatuses = [],
  requireRoles = []
}) => {
  const { isFetching, isAuthenticated, hasAccess } = useHasAccess({
    requireStatuses,
    requireRoles
  })

  if (isFetching) {
    return <Spinner />
  }

  if (!isAuthenticated) {
    return <Navigate to='/' replace />
  }

  // Render 404 inline to preserve URL and prevent route enumeration attacks.
  // ErrorLayout ensures consistent styling with the catch-all route.
  if (!hasAccess) {
    return (
      <ErrorLayout>
        <NotFoundErrorPage />
      </ErrorLayout>
    )
  }

  return children
}
