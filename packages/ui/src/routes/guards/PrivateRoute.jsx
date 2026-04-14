import { Spinner } from '@ui/components/Spinner'
import { useHasAccess } from '@ui/hooks/useHasAccess'
import { Navigate } from '@ui/hooks/useRouter'
import { ErrorLayout } from '@ui/layouts'
import { NotFoundErrorPage } from '@ui/pages/errors'

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
