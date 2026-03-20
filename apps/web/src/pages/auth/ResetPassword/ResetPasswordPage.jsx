import { useNavigate } from 'react-router-dom'

import { InvisibleReCaptcha } from '@/components/InvisibleReCaptcha'
import { LoginPrompt } from '@/components/prompts'
import { useRequestPasswordReset, useResetPassword } from '@/hooks/useAuth'
import { useCaptcha } from '@/hooks/useCaptcha'
import { useLocale } from '@/hooks/useLocale'
import { useTheme } from '@/hooks/useTheme'
import { useToast } from '@/hooks/useToast'
import { useUrlParams } from '@/hooks/useUrlParams'

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
