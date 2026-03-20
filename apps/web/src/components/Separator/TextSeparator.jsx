import { Separator } from '@/components/ui'
import { cn } from '@/lib/utils'

export const TextSeparator = ({ text, align = 'center', className }) => (
  <div className={cn('flex items-center', className)}>
    <Separator className={cn('flex-1', align === 'left' && 'max-w-4')} />
    {text && (
      <span className='text-muted-foreground shrink-0 px-2 text-sm'>
        {text}
      </span>
    )}
    <Separator className={cn('flex-1', align === 'right' && 'max-w-4')} />
  </div>
)
