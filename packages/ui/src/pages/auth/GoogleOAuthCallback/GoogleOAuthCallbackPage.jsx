import { Spinner } from '@ui/components/Spinner'
import { useCompleteGoogleLogin } from '@ui/hooks/useAuth'
import { useLocale } from '@ui/hooks/useLocale'
import { useNavigate } from '@ui/hooks/useRouter'
import { useToast } from '@ui/hooks/useToast'
import { useUrlParams } from '@ui/hooks/useUrlParams'
import { useEffect, useRef } from 'react'

export const GoogleOAuthCallbackPage = () => {
  const { te } = useLocale()
  const navigate = useNavigate()
  const { showErrorToast } = useToast()
  const { mutate: completeGoogleLogin } = useCompleteGoogleLogin()
  const { new: isNew } = useUrlParams(['new'])
  const called = useRef(false)

  useEffect(() => {
    if (called.current) {
      return
    }

    called.current = true

    completeGoogleLogin(undefined, {
      onSuccess: () => {
        navigate('/home', { replace: true, state: { showWelcome: isNew } })
      },
      onError: error => {
        showErrorToast(te(error))
        navigate('/login', { replace: true })
      }
    })
  }, [completeGoogleLogin, isNew, navigate, showErrorToast, te])

  return <Spinner />
}
