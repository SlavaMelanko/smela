import { Alert } from '@ui/components/Alert'
import { GoogleIcon } from '@ui/components/icons'
import { InvisibleReCaptcha } from '@ui/components/InvisibleReCaptcha'
import { ForgotYourPasswordPrompt, SignupPrompt } from '@ui/components/prompts'
import { TextSeparator } from '@ui/components/Separator'
import { Button } from '@ui/components/ui'
import { useLogin, useLoginWithGoogle } from '@ui/hooks/useAuth'
import { useCaptcha } from '@ui/hooks/useCaptcha'
import { useLocale } from '@ui/hooks/useLocale'
import { useNavigate, useSearchParams } from '@ui/hooks/useRouter'
import { useToast } from '@ui/hooks/useToast'

import { AuthRoot } from '../Auth'
import { LoginForm } from './Form'

export const LoginPage = () => {
  const { t, te } = useLocale()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { mutate: logInWithEmail, isPending: isEmailPending } = useLogin()
  const { mutate: logInWithGoogle, isPending: isGooglePending } =
    useLoginWithGoogle()
  const { showErrorToast } = useToast()
  const { captchaRef, getCaptchaToken } = useCaptcha()

  const handleLogin = async data => {
    const token = await getCaptchaToken()

    if (!token) {
      showErrorToast(t('captcha.error'))

      return
    }

    logInWithEmail(
      { ...data, captcha: { token } },
      {
        onSuccess: () => {
          navigate('/')
        },
        onError: error => {
          showErrorToast(te(error))
        }
      }
    )
  }

  const handleLoginWithGoogle = () => {
    logInWithGoogle(undefined, {
      onSuccess: () => {
        navigate('/')
      },
      onError: error => {
        showErrorToast(te(error))
      }
    })
  }

  return (
    <>
      <AuthRoot>
        {searchParams.get('reason') && (
          <Alert title={t(`backend.${searchParams.get('reason')}`)} />
        )}

        <div className='flex flex-col gap-2'>
          <LoginForm isLoading={isEmailPending} onSubmit={handleLogin} />

          <TextSeparator text={t('or')} />

          <div className='flex flex-col gap-4'>
            <Button
              variant='outline'
              className='w-full'
              onClick={handleLoginWithGoogle}
              disabled={isGooglePending}
            >
              <GoogleIcon />
              {t('continueWithGoogle')}
            </Button>
          </div>
        </div>

        <SignupPrompt />

        <ForgotYourPasswordPrompt />
      </AuthRoot>

      <InvisibleReCaptcha ref={captchaRef} />
    </>
  )
}
