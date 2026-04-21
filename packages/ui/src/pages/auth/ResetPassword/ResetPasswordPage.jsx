import { InvisibleReCaptcha } from '@ui/components/InvisibleReCaptcha'
import { LoginPrompt } from '@ui/components/prompts'
import { useRequestPasswordReset, useResetPassword } from '@ui/hooks/useAuth'
import { useCaptcha } from '@ui/hooks/useCaptcha'
import { useLocale } from '@ui/hooks/useLocale'
import { useNavigate } from '@ui/hooks/useRouter'
import { useTheme } from '@ui/hooks/useTheme'
import { useToast } from '@ui/hooks/useToast'
import { useUrlParams } from '@ui/hooks/useUrlParams'

import { AuthDescription, AuthHeader, AuthRoot, AuthTitle } from '../Auth'
import { EmailForm } from './EmailForm'
import { ResetPasswordForm } from './PasswordForm'

export const ResetPasswordPage = () => {
  const { t, locale } = useLocale()
  const { theme } = useTheme()
  const { showSuccessToast, showErrorToast } = useToast()
  const navigate = useNavigate()
  const { token: urlToken } = useUrlParams(['token'])
  const { mutate: requestPasswordReset, isPending: isRequestPending } =
    useRequestPasswordReset()
  const { mutate: resetPassword, isPending: isResetPending } =
    useResetPassword()
  const { captchaRef, getCaptchaToken } = useCaptcha()

  const isRequest = !urlToken

  const handleRequestPasswordReset = async data => {
    const token = await getCaptchaToken()

    if (!token) {
      showErrorToast(t('captcha.error'))

      return
    }

    const preferences = { locale, theme }

    requestPasswordReset(
      { ...data, captcha: { token }, preferences },
      {
        onSuccess: () => {
          showSuccessToast(t('password.reset.request.success'))
        },
        onError: () => {
          showErrorToast(t('error.unknown'))
        }
      }
    )
  }

  const handleResetPassword = data => {
    resetPassword(
      { token: urlToken, password: data.newPassword },
      {
        onSuccess: () => {
          showSuccessToast(t('password.reset.set.success'))
          navigate('/')
        },
        onError: () => {
          showErrorToast(t('password.reset.set.error'))
        }
      }
    )
  }

  return (
    <>
      <AuthRoot>
        <AuthHeader>
          <AuthTitle>{t('password.reset.title')}</AuthTitle>
          <AuthDescription>
            {isRequest
              ? t('password.reset.request.description')
              : t('password.reset.set.description')}
          </AuthDescription>
        </AuthHeader>

        {isRequest ? (
          <EmailForm
            isLoading={isRequestPending}
            onSubmit={handleRequestPasswordReset}
          />
        ) : (
          <ResetPasswordForm
            isLoading={isResetPending}
            onSubmit={handleResetPassword}
          />
        )}

        <LoginPrompt question={t('password.reset.rememberYourPassword')} />
      </AuthRoot>

      <InvisibleReCaptcha ref={captchaRef} />
    </>
  )
}
