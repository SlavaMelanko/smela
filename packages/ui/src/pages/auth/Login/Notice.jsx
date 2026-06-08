import { Alert } from '@ui/components/Alert'
import { useLocale } from '@ui/hooks/useLocale'
import { useUrlParams } from '@ui/hooks/useUrlParams'

export const Notice = () => {
  const { t } = useLocale()
  const { error, info } = useUrlParams(['error', 'info'])

  if (error) {
    return <Alert variant='destructive' title={t(`backend.${error}`)} />
  }

  if (info) {
    return <Alert title={t(`backend.${info}`)} />
  }

  return null
}
