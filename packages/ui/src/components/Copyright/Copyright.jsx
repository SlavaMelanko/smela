import { useLocale } from '@ui/hooks/useLocale'
import env from '@ui/lib/env'
import { cn } from '@ui/lib/utils'

const currentYear = new Date().getFullYear()

export const Copyright = ({ className }) => {
  const { t } = useLocale()

  return (
    <div
      className={cn(
        'text-center text-xs font-light text-muted-foreground',
        className
      )}
    >
      {t('copyright', { year: currentYear, companyName: env.APP_NAME })}
    </div>
  )
}
