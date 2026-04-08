import { Spinner } from '@ui/components/Spinner'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { userActiveStatuses } from '@ui/lib/types'
import { Navigate } from 'react-router-dom'

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
