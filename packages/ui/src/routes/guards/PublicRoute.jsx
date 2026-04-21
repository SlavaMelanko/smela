import { Spinner } from '@ui/components/Spinner'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { Navigate } from '@ui/hooks/useRouter'
import { userActiveStatuses } from '@ui/lib/types'

export const PublicRoute = ({ children }) => {
  const { isFetching, isAuthenticated, user: me } = useCurrentUser()

  if (isFetching) {
    return <Spinner />
  }

  if (isAuthenticated && userActiveStatuses.includes(me?.status)) {
    return <Navigate to='/' replace />
  }

  return children
}
