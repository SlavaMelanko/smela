import { Navigate } from 'react-router-dom'

import { Spinner } from '@/components/Spinner'
import { useHasAccess } from '@/hooks/useHasAccess'
import { ErrorLayout } from '@/layouts'
import { NotFoundErrorPage } from '@/pages/errors'

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
