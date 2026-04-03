import { createContext, useCallback, useMemo } from 'react'
import { toast } from 'sonner'

import { Toaster } from '@/components/notifications'

const ToastContext = createContext(undefined)

export const ToastProvider = ({ children }) => {
  const showSuccessToast = useCallback(message => toast.success(message), [])
  const showErrorToast = useCallback(message => toast.error(message), [])

  const value = useMemo(
    () => ({ showSuccessToast, showErrorToast }),
    [showSuccessToast, showErrorToast]
  )

  return (
    <ToastContext value={value}>
      {children}
      <Toaster />
    </ToastContext>
  )
}

export default ToastContext
