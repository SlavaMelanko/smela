import { useNavigate, useRouteError } from '@ui/hooks/useRouter'
import { captureError } from '@ui/services/errorTracker'
import { useEffect } from 'react'

export const ErrorBoundary = () => {
  const error = useRouteError()
  const navigate = useNavigate()

  useEffect(() => {
    captureError(error)

    navigate('/errors/general', { replace: true })
  }, [error, navigate])

  return null
}
