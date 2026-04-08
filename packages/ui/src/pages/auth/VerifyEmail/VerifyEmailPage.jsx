import { Spinner } from '@ui/components/Spinner'
import { useLocale } from '@ui/hooks/useLocale'
import { useToast } from '@ui/hooks/useToast'
import { useUrlParams } from '@ui/hooks/useUrlParams'
import { useVerifyEmailOnce } from '@ui/hooks/useVerifyEmailOnce'
import { useNavigate } from 'react-router-dom'

export const VerifyEmailPage = () => {
  const { t, te } = useLocale()
  const { showErrorToast, showSuccessToast } = useToast()
  const navigate = useNavigate()
  const { token } = useUrlParams(['token'])

  useVerifyEmailOnce(token, {
    onSettled: (data, error) => {
      if (data?.user) {
        showSuccessToast(t('email.verification.success'))
      }

      if (error) {
        showErrorToast(te(error))
      }

      navigate('/')
    }
  })

  return <Spinner />
}
