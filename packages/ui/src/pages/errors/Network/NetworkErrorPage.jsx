import { useLocale } from '@ui/hooks/useLocale'
import { useNavigate } from '@ui/hooks/useRouter'
import { useUrlParams } from '@ui/hooks/useUrlParams'
import { NetworkErrorType } from '@ui/lib/net'
import { CloudAlert } from 'lucide-react'

import {
  ErrorButton,
  ErrorContent,
  ErrorDescription,
  ErrorIcon,
  ErrorRoot,
  ErrorTitle
} from '../Error'

export const NetworkErrorPage = () => {
  const { t } = useLocale()
  const navigate = useNavigate()
  const { errorType } = useUrlParams(['errorType'])

  return (
    <ErrorRoot data-testid='network-error-page'>
      <ErrorIcon as={CloudAlert} />
      <ErrorContent>
        <ErrorTitle>{t('error.network.title')}</ErrorTitle>
        <ErrorDescription>
          {t(`error.network.message.${errorType || NetworkErrorType.UNKNOWN}`)}
        </ErrorDescription>
      </ErrorContent>
      <ErrorButton onClick={() => navigate(-1)}>
        {t('error.network.cta')}
      </ErrorButton>
    </ErrorRoot>
  )
}
