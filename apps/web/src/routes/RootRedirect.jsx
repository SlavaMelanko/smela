import { Navigate } from 'react-router-dom'

import { Spinner } from '@/components/Spinner'
import { useCurrentUser } from '@/hooks/useAuth'
import {
  adminActiveStatuses,
  isAdmin,
  isUser,
  userActiveStatuses,
  UserStatus
} from '@/lib/types'

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

  if (isAuthenticated && status === UserStatus.NEW) {
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
