import { useEffect } from 'react'
import { useNavigate, useRouteError } from 'react-router-dom'

import { captureError } from '@/services/errorTracker'

export const ErrorBoundary = () => {
  const error = useRouteError()
  const navigate = useNavigate()

  useEffect(() => {
    captureError(error)

    navigate('/errors/general', { replace: true })
  }, [error, navigate])

  return null
}
