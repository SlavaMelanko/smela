import { Badge } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { cn } from '@ui/lib/utils'

export const LastUsedBadge = ({ className }) => {
  const { t } = useLocale()

  return (
    <Badge
      variant='secondary'
      className={cn(
        'absolute right-2 top-0 -translate-y-1/2 font-light',
        className
      )}
    >
      {t('lastUsed')}
    </Badge>
  )
}
