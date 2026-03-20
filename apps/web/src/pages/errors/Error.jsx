import { Button } from '@/components/ui'

export const ErrorRoot = ({ children, 'data-testid': testId }) => (
  <div className='flex flex-col items-center gap-8' data-testid={testId}>
    {children}
  </div>
)

export const ErrorContent = ({ children }) => (
  <div className='flex flex-col items-center gap-4'>{children}</div>
)

export const ErrorIcon = ({ as: IconComponent }) => (
  <IconComponent className='size-12 text-destructive' />
)

export const ErrorTitle = ({ children }) => (
  <h1 className='text-center text-2xl font-semibold'>{children}</h1>
)

export const ErrorDescription = ({ children }) => (
  <p className='text-center text-muted-foreground'>{children}</p>
)

export const ErrorButton = ({ children, onClick }) => (
  <Button className='w-full' variant='outline' onClick={onClick}>
    {children}
  </Button>
)
