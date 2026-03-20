import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const promptVariants = cva(
  'inline-flex flex-wrap items-baseline justify-center gap-x-1 text-muted-foreground',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        default: 'text-base',
        lg: 'text-lg'
      }
    },
    defaultVariants: {
      size: 'sm'
    }
  }
)

export const Prompt = ({ className, size, children, ...props }) => (
  <p className={cn(promptVariants({ size }), className)} {...props}>
    {children}
  </p>
)
