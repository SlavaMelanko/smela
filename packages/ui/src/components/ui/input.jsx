import { Input as InputPrimitive } from '@base-ui/react/input'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const inputVariants = cva(
  'h-11 w-full rounded-md border border-border bg-background px-4 text-base outline-none placeholder:text-muted-foreground placeholder:font-light focus-visible:ring-[1px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      state: {
        default: '',
        error:
          'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
      }
    },
    defaultVariants: {
      state: 'default'
    }
  }
)

const IconWrapper = ({ position, children }) =>
  children ? (
    <div
      className={cn(
        'absolute top-1/2 flex -translate-y-1/2 items-center',
        position === 'left' ? 'left-4' : 'right-4'
      )}
    >
      {children}
    </div>
  ) : null

function Input({
  ref,
  type = 'text',
  autoComplete = 'off',
  className,
  leftIcon,
  rightIcon,
  error,
  ...props
}) {
  const state = error ? 'error' : 'default'

  return (
    <div className='relative'>
      <IconWrapper position='left'>{leftIcon}</IconWrapper>
      <InputPrimitive
        ref={ref}
        type={type}
        autoComplete={autoComplete}
        className={cn(
          inputVariants({ state }),
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          className
        )}
        {...props}
      />
      <IconWrapper position='right'>{rightIcon}</IconWrapper>
    </div>
  )
}

export { Input, inputVariants }
