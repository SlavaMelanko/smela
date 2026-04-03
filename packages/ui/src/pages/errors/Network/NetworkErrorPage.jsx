import { CloudAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useLocale } from '@/hooks/useLocale'
import { useUrlParams } from '@/hooks/useUrlParams'
import { NetworkErrorType } from '@/lib/net'

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
