import { useLocale } from '@/hooks/useLocale'

export const YouBadge = ({ className = 'text-sm' }) => {
  const { t } = useLocale()

  return (
    <span className={`m-1 font-light text-muted-foreground ${className}`}>
      ({t('you')})
    </span>
  )
}
