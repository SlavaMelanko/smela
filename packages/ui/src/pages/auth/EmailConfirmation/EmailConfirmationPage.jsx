import { useLocation } from 'react-router-dom'

import { InvisibleReCaptcha } from '@/components/InvisibleReCaptcha'
import { EmailLink } from '@/components/links'
import { useCurrentUser, useResendVerificationEmail } from '@/hooks/useAuth'
import { useCaptcha } from '@/hooks/useCaptcha'
import { useLocale } from '@/hooks/useLocale'
import { useTheme } from '@/hooks/useTheme'
import { useToast } from '@/hooks/useToast'

import { AuthDescription, AuthHeader, AuthRoot, AuthTitle } from '../Auth'
import { EmailConfirmationForm } from './Form'

export const EmailConfirmationPage = () => {
  const { t, te, locale } = useLocale()
  const { theme } = useTheme()
  const location = useLocation()
  const { mutate: resendVerificationEmail, isPending } =
    useResendVerificationEmail()
  const { showSuccessToast, showErrorToast } = useToast()
  const { user: me } = useCurrentUser()
  const { captchaRef, getCaptchaToken } = useCaptcha()

  const email = location.state?.email || me?.email

  const handleResendVerificationEmail = async data => {
    const token = await getCaptchaToken()

    if (!token) {
      showErrorToast(t('captcha.error'))

      return
    }

    const preferences = { locale, theme }

    resendVerificationEmail(
      { ...data, captcha: { token }, preferences },
      {
        onSuccess: () => {
          showSuccessToast(t('email.confirmation.success'))
        },
        onError: error => {
          showErrorToast(te(error))
        }
      }
    )
  }

  return (
    <>
      <AuthRoot>
        <AuthHeader>
          <AuthTitle>{t('email.confirmation.title')}</AuthTitle>
          <AuthDescription>
            {t('email.confirmation.description.start')}{' '}
            {email ? (
              <EmailLink email={email} />
            ) : (
              t('email.confirmation.yourEmail')
            )}
            . {t('email.confirmation.description.end')}
          </AuthDescription>
        </AuthHeader>

        <EmailConfirmationForm
          isLoading={isPending}
          email={email}
          onSubmit={handleResendVerificationEmail}
        />
      </AuthRoot>

      <InvisibleReCaptcha ref={captchaRef} />
    </>
  )
}
