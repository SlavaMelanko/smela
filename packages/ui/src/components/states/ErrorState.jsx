import { Button } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { AlertCircle, RefreshCw } from 'lucide-react'

import { StateIcon, StateRoot, StateTitle } from './State'

const RetryButton = ({ onClick }) => {
  const { t } = useLocale()

  return (
    <Button variant='outline' onClick={onClick}>
      <RefreshCw className='size-4' />
      <span>{t('tryAgain')}</span>
    </Button>
  )
}

export const ErrorState = ({
  text,
  error,
  className,
  centered = true,
  onRetry
}) => {
  const { te } = useLocale()
  const retry = onRetry ?? (() => window.location.reload())
  const message = text ?? te(error)

  return (
    <StateRoot className={className} centered={centered}>
      <StateIcon icon={AlertCircle} className='text-destructive' />
      <StateTitle className='text-destructive'>{message}</StateTitle>
      <RetryButton onClick={retry} />
    </StateRoot>
  )
}
