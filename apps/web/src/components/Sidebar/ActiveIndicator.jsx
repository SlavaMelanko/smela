import { cn } from '@/lib/utils'

export const ActiveIndicator = ({ isActive, className }) => (
  <div
    className={cn(
      'absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full bg-primary transition-opacity',
      isActive ? 'opacity-100' : 'opacity-0',
      className
    )}
  />
)
