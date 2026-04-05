import { Spinner } from '@ui/components/Spinner'
import { useCurrentUser } from '@ui/hooks/useAuth'
import {
  adminActiveStatuses,
  isAdmin,
  isUser,
  userActiveStatuses,
  UserStatus
} from '@ui/lib/types'
import { Navigate } from 'react-router-dom'

export const RootRedirect = () => {
  const { isFetching, isAuthenticated, user: me, isError } = useCurrentUser()

  if (isError) {
    return <Navigate to='/login' replace />
  }

  if (isFetching) {
    return <Spinner />
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  const status = me?.status

  if (isAuthenticated && status === UserStatus.New) {
    return <Navigate to='/email-confirmation' replace />
  }

  const role = me?.role

  if (isAuthenticated && isUser(role) && userActiveStatuses.includes(status)) {
    return <Navigate to='/home' replace />
  }

  if (
    isAuthenticated &&
    isAdmin(role) &&
    adminActiveStatuses.includes(status)
  ) {
    return <Navigate to='/admin/dashboard' replace />
  }

  return <Navigate to='/login' replace />
}
