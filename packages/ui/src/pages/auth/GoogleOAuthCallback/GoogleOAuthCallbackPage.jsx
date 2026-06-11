import { Spinner } from '@ui/components/Spinner'
import { useCompleteGoogleLogin } from '@ui/hooks/useAuth'
import { useNavigate } from '@ui/hooks/useRouter'
import { useUrlParams } from '@ui/hooks/useUrlParams'
import { withQuery } from '@ui/lib/url'
import { useEffect, useRef } from 'react'

export const GoogleOAuthCallbackPage = () => {
  const navigate = useNavigate()
  const { mutateAsync: completeGoogleLoginAsync } = useCompleteGoogleLogin()
  const { new: isNew } = useUrlParams(['new'])
  const called = useRef(false)

  useEffect(() => {
    if (called.current) {
      return
    }

    called.current = true

    completeGoogleLoginAsync()
      .then(() => {
        navigate('/home', { replace: true, state: { showWelcome: isNew } })
      })
      .catch(error => {
        navigate(withQuery('/login', { error: error?.code }), {
          replace: true
        })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Spinner />
}
