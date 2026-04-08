import { useLocale } from '@ui/hooks/useLocale'
import { captureMessage } from '@ui/services/errorTracker'
import { SearchX } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  ErrorButton,
  ErrorContent,
  ErrorDescription,
  ErrorIcon,
  ErrorRoot,
  ErrorTitle
} from '../Error'

export const NotFoundErrorPage = () => {
  const { t } = useLocale()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    captureMessage(`404 Not Found: ${location.pathname}${location.search}`)
  }, [location.pathname, location.search])

  return (
    <ErrorRoot data-testid='not-found-error-page'>
      <ErrorIcon as={SearchX} />
      <ErrorContent>
        <ErrorTitle>{t('error.notFound.title')}</ErrorTitle>
        <ErrorDescription>{t('error.notFound.message')}</ErrorDescription>
      </ErrorContent>
      <ErrorButton onClick={() => navigate('/')}>
        {t('error.notFound.cta')}
      </ErrorButton>
    </ErrorRoot>
  )
}
