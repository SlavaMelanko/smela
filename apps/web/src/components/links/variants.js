import { cva } from 'class-variance-authority'

export const linkVariants = cva(
  'font-medium text-link transition-colors duration-300 hover:text-link-foreground focus:text-link-foreground',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        default: 'text-base',
        lg: 'text-lg'
      },
      underline: {
        hover: 'hover:underline',
        always: 'underline',
        none: ''
      }
    },
    defaultVariants: {
      size: 'default',
      underline: 'hover'
    }
  }
)
