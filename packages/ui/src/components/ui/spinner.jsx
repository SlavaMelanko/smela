import { LoaderIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const Spinner = ({ className, size = 24, ...props }) => (
  <LoaderIcon
    className={cn('animate-spin', className)}
    size={size}
    {...props}
  />
)

Spinner.displayName = 'Spinner'

export { Spinner }
