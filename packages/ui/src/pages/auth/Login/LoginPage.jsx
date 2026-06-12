import { InvisibleReCaptcha } from '@ui/components/InvisibleReCaptcha'
import { ForgotYourPasswordPrompt, SignupPrompt } from '@ui/components/prompts'
import { TextSeparator } from '@ui/components/Separator'
import { GoogleOAuthButton, SocialOAuthGroup } from '@ui/components/socialAuth'
import { useLogin, useLoginWithGoogle } from '@ui/hooks/useAuth'
import { useCaptcha } from '@ui/hooks/useCaptcha'
import { useLocale } from '@ui/hooks/useLocale'
import { useNavigate } from '@ui/hooks/useRouter'
import { useToast } from '@ui/hooks/useToast'
import { AuthMethod, wasLastAuthMethod } from '@ui/lib/storage'

import { AuthRoot } from '../Auth'
import { LoginForm } from './Form'
import { Notice } from './Notice'

const defaultOptions = {
  showSignupPrompt: true,
  showSocialLogin: true
}

export const LoginPage = ({ options = {} }) => {
  const { t, te } = useLocale()
  const navigate = useNavigate()
  const { mutate: logInWithEmail, isPending: isEmailPending } = useLogin()
  const { mutate: logInWithGoogle, isPending: isGooglePending } =
    useLoginWithGoogle()
  const { showErrorToast } = useToast()
  const { captchaRef, getCaptchaToken } = useCaptcha()

  const { showSignupPrompt, showSocialLogin } = {
    ...defaultOptions,
    ...options
  }

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
      onError: error => {
        showErrorToast(te(error))
      }
    })
  }

  return (
    <>
      <AuthRoot>
        <Notice />

        <div className='flex flex-col gap-2'>
          <LoginForm
            isLastUsed={wasLastAuthMethod(AuthMethod.Email)}
            isLoading={isEmailPending}
            onSubmit={handleLogin}
          />

          {showSocialLogin && (
            <>
              <TextSeparator text={t('or')} />

              <SocialOAuthGroup>
                <GoogleOAuthButton
                  onClick={handleLoginWithGoogle}
                  isPending={isGooglePending}
                />
              </SocialOAuthGroup>
            </>
          )}
        </div>

        {showSignupPrompt && <SignupPrompt />}

        <ForgotYourPasswordPrompt />
      </AuthRoot>

      <InvisibleReCaptcha ref={captchaRef} />
    </>
  )
}
