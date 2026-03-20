import { cn } from '@/lib/utils'

export const PageContent = ({ children, className }) => (
  <div className={cn('flex flex-col gap-4 md:gap-6 lg:gap-8', className)}>
    {children}
  </div>
)
