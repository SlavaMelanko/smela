import { useEffect, useRef } from 'react'

import { useVerifyEmail } from './useAuth'

/**
 * Handles email verification with StrictMode-safe guard to prevent double execution.
 *
 * Note: onSuccess is intentionally omitted. Use onSettled to show toasts
 * before navigation to prevent them from being lost during unmount.
 */
export const useVerifyEmailOnce = (token, { onSettled }) => {
  const { mutate: verifyEmail } = useVerifyEmail({ onSettled })
  const hasVerified = useRef(false)

  useEffect(() => {
    if (hasVerified.current) {
      return
    }

    hasVerified.current = true

    verifyEmail({ token }, { onSettled })
  }, [token, verifyEmail, onSettled])
}
