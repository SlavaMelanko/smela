import { cn } from '@/lib/utils'

export const LayoutRoot = ({ children }) => (
  <div
    data-testid='layout-root'
    className='relative flex min-h-screen flex-col items-center justify-center overflow-y-auto bg-background p-8'
  >
    {children}
  </div>
)

export const LayoutContent = ({ children, className }) => (
  <div
    data-testid='layout-content'
    className={cn('flex w-full flex-col gap-12', className)}
  >
    {children}
  </div>
)

export const LayoutTopRightControls = ({ children }) => (
  <div
    data-testid='layout-top-right-controls'
    className='absolute top-2 right-4 z-10 flex gap-4 md:top-4 md:right-8'
  >
    {children}
  </div>
)
