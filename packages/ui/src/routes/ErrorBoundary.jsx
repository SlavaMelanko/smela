import { captureError } from '@ui/services/errorTracker'
import { useEffect } from 'react'
import { useNavigate, useRouteError } from 'react-router-dom'

export const ErrorBoundary = () => {
  const error = useRouteError()
  const navigate = useNavigate()

  useEffect(() => {
    captureError(error)

    navigate('/errors/general', { replace: true })
  }, [error, navigate])

  return null
}
