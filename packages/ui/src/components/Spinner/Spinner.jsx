import { Spinner as ShadcnSpinner } from '@/components/ui'
import { cn } from '@/lib/utils'

const sizeMap = {
  sm: { icon: 16, text: 'text-xs' },
  md: { icon: 24, text: 'text-sm' },
  lg: { icon: 32, text: 'text-base' },
  xl: { icon: 48, text: 'text-base' }
}

export const Spinner = ({ text, size = 'md', className, ...props }) => (
  <div
    className={cn(
      'absolute inset-0 flex items-center justify-center',
      className
    )}
  >
    <div className='flex flex-col items-center gap-2'>
      <ShadcnSpinner size={sizeMap[size].icon} {...props} />
      {text && (
        <span className={cn('text-muted-foreground', sizeMap[size].text)}>
          {text}
        </span>
      )}
    </div>
  </div>
)
