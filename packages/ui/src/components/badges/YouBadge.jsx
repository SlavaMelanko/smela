import { useLocale } from '@ui/hooks/useLocale'
import { cn } from '@ui/lib/utils'

export const YouBadge = ({ className = 'text-sm' }) => {
  const { t } = useLocale()

  return (
    <span className={cn('m-1 font-light text-muted-foreground', className)}>
      ({t('you')})
    </span>
  )
}
