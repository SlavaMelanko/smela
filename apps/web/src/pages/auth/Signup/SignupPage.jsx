import { useNavigate } from 'react-router-dom'

import { GoogleIcon } from '@/components/icons'
import { InvisibleReCaptcha } from '@/components/InvisibleReCaptcha'
import { LoginPrompt, TermsAndPrivacyPrompt } from '@/components/prompts'
import { TextSeparator } from '@/components/Separator'
import { Button } from '@/components/ui'
import {
  useUserSignupWithEmail,
  useUserSignupWithGoogle
} from '@/hooks/useAuth'
import { useCaptcha } from '@/hooks/useCaptcha'
import { useLocale } from '@/hooks/useLocale'
import { useTheme } from '@/hooks/useTheme'
import { useToast } from '@/hooks/useToast'

import { AuthRoot } from '../Auth'
import { SignupForm } from './Form'

export const SignupPage = () => {
  const { t, te, locale } = useLocale()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { showErrorToast } = useToast()
  const { mutate: signUpWithEmail, isPending: isEmailPending } =
    useUserSignupWithEmail()
  const { mutate: signUpWithGoogle, isPending: isGooglePending } =
    useUserSignupWithGoogle()
  const { captchaRef, getCaptchaToken } = useCaptcha()

  const handleSignupWithEmail = async data => {
    const token = await getCaptchaToken()

    if (!token) {
      showErrorToast(t('captcha.error'))

      return
    }

    const preferences = { locale, theme }

    signUpWithEmail(
      { ...data, captcha: { token }, preferences },
      {
        onSuccess: () => {
          navigate('/email-confirmation', { state: { email: data.email } })
        },
        onError: error => {
          showErrorToast(te(error))
        }
      }
    )
  }

  const handleSignupWithGoogle = () => {
    signUpWithGoogle(undefined, {
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
        <div className='flex flex-col gap-2'>
          <SignupForm
            isLoading={isEmailPending}
            onSubmit={handleSignupWithEmail}
          />

          <TextSeparator text={t('or')} />

          <div className='flex flex-col gap-4'>
            <Button
              variant='outline'
              className='w-full'
              onClick={handleSignupWithGoogle}
              disabled={isGooglePending}
            >
              <GoogleIcon />
              {t('continueWithGoogle')}
            </Button>
          </div>
        </div>

        <div className='-mt-5'>
          <TermsAndPrivacyPrompt />
        </div>

        <LoginPrompt question={t('alreadyHaveAccount')} />
      </AuthRoot>

      <InvisibleReCaptcha ref={captchaRef} />
    </>
  )
}
