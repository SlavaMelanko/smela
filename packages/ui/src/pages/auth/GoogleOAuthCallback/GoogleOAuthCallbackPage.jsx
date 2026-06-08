import { Spinner } from '@ui/components/Spinner'
import { useCompleteGoogleLogin } from '@ui/hooks/useAuth'
import { useNavigate } from '@ui/hooks/useRouter'
import { useUrlParams } from '@ui/hooks/useUrlParams'
import { withQuery } from '@ui/lib/url'
import { useEffect, useRef } from 'react'

export const GoogleOAuthCallbackPage = () => {
  const navigate = useNavigate()
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
        navigate(withQuery('/login', { error: error?.code }), {
          replace: true
        })
      }
    })
  }, [completeGoogleLogin, isNew, navigate])

  return <Spinner />
}
