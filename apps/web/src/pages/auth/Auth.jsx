import { cn } from '@/lib/utils'

export const AuthRoot = ({ children }) => (
  <div className='flex flex-col gap-8'>{children}</div>
)

export const AuthHeader = ({ children }) => (
  <div className='flex flex-col gap-4 text-center'>{children}</div>
)

export const AuthTitle = ({ children }) => (
  <h1 className='text-2xl font-semibold text-foreground'>{children}</h1>
)

export const AuthDescription = ({ children, className }) => (
  <p className={cn('text-base text-muted-foreground', className)}>{children}</p>
)
