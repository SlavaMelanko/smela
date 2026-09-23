import { useLocale } from '@ui/hooks/useLocale'
import { useLocation, useNavigate } from '@ui/hooks/useRouter'
import { useToast } from '@ui/hooks/useToast'
import { useEffect, useRef } from 'react'

// Shows the post-signup welcome toast once, then clears router state so
// back-navigation can't replay it.
export const useWelcomeToast = () => {
  const { t } = useLocale()
  const { showSuccessToast } = useToast()
  const { state, pathname } = useLocation()
  const navigate = useNavigate()
  const welcomed = useRef(false)

  const { showWelcome } = state ?? {}

  useEffect(() => {
    if (!showWelcome || welcomed.current) {
      return
    }

    welcomed.current = true
    showSuccessToast(t('email.verification.success'))
    navigate(pathname, { replace: true })
  }, [showWelcome, showSuccessToast, t, navigate, pathname])
}
