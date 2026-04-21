import { cn } from '@ui/lib/utils'
import { LoaderIcon } from 'lucide-react'

const Spinner = ({ className, size = 24, ...props }) => (
  <LoaderIcon
    className={cn('animate-spin', className)}
    size={size}
    {...props}
  />
)

Spinner.displayName = 'Spinner'

export { Spinner }
