import { Navigate } from 'react-router-dom'

import { Spinner } from '@/components/Spinner'
import { useCurrentUser } from '@/hooks/useAuth'
import { userActiveStatuses } from '@/lib/types'

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
