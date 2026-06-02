import { useLocale } from '@ui/hooks/useLocale'
import { ShieldX } from 'lucide-react'

import {
  ErrorButton,
  ErrorContent,
  ErrorDescription,
  ErrorIcon,
  ErrorRoot,
  ErrorTitle
} from '../Error'

export const ForbiddenErrorPage = () => {
  const { t } = useLocale()

  return (
    <ErrorRoot data-testid='forbidden-error-page'>
      <ErrorIcon as={ShieldX} />
      <ErrorContent>
        <ErrorTitle>{t('error.forbidden.title')}</ErrorTitle>
        <ErrorDescription>{t('error.forbidden.message')}</ErrorDescription>
      </ErrorContent>
      <ErrorButton onClick={() => (window.location.href = '/')}>
        {t('error.forbidden.cta')}
      </ErrorButton>
    </ErrorRoot>
  )
}
