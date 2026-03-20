import { cn } from '@/lib/utils'

export const StateRoot = ({ children, className, centered }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-4',
      centered && 'min-h-[50vh]',
      className
    )}
  >
    {children}
  </div>
)

export const StateIcon = ({ icon: Icon, className }) => (
  <Icon className={cn('size-8', className)} />
)

export const StateTitle = ({ children, className }) => (
  <p className={cn('text-base', className)}>{children}</p>
)
