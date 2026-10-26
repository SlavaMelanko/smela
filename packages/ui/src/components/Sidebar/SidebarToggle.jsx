import { Button, useSidebar } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { cn } from '@ui/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const SidebarToggle = ({ compact, className }) => {
  const { t } = useLocale()
  const { toggleSidebar } = useSidebar()
  const label = t(compact ? 'sidebar.expand' : 'sidebar.collapse')
  const Icon = compact ? ChevronRight : ChevronLeft

  return (
    <Button
      variant='ghost'
      size='icon-xs'
      className={cn('border-0 text-muted-foreground', className)}
      aria-label={label}
      title={label}
      onClick={toggleSidebar}
    >
      <Icon className='size-4' />
    </Button>
  )
}
