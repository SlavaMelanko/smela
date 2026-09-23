import { useEffect, useRef } from 'react'

import { useVerifyEmail } from './useAuth'

// Runs verification once (StrictMode-safe). mutateAsync's promise is bound to
// the mutation, not the observer, so onSettled survives an unmount mid-request.
export const useVerifyEmailOnce = (token, { onSettled }) => {
  const { mutateAsync: verifyEmail } = useVerifyEmail()
  const hasVerified = useRef(false)

  useEffect(() => {
    if (!token || hasVerified.current) {
      return
    }

    hasVerified.current = true

    verifyEmail({ token })
      .then(data => onSettled(data, null))
      .catch(error => onSettled(null, error))
  }, [token, verifyEmail, onSettled])
}
