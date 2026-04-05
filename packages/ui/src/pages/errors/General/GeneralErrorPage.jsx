import { useLocale } from '@ui/hooks/useLocale'
import { ServerCrash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  ErrorButton,
  ErrorContent,
  ErrorDescription,
  ErrorIcon,
  ErrorRoot,
  ErrorTitle
} from '../Error'

export const GeneralErrorPage = () => {
  const { t } = useLocale()
  const navigate = useNavigate()

  return (
    <ErrorRoot data-testid='general-error-page'>
      <ErrorIcon as={ServerCrash} />
      <ErrorContent>
        <ErrorTitle>{t('error.general.title')}</ErrorTitle>
        <ErrorDescription>{t('error.general.message')}</ErrorDescription>
      </ErrorContent>
      <ErrorButton onClick={() => navigate('/')}>
        {t('error.general.cta')}
      </ErrorButton>
    </ErrorRoot>
  )
}
