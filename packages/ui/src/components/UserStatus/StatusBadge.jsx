import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/lib/utils'

import { getStatusTextColor } from './colors'

export const StatusBadge = ({ status }) => {
  const { t } = useLocale()

  if (!status) {
    return null
  }

  return (
    <span className={cn(getStatusTextColor(status))} data-testid='status-badge'>
      {t(`status.values.${status}`)}
    </span>
  )
}
