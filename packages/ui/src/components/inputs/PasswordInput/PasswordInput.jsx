import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@/components/ui'

export const PasswordInput = ({
  ref,
  defaultVisible = false,
  toggleAriaLabel = 'Toggle password visibility',
  onVisibilityChange,
  disabled,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(defaultVisible)

  const toggleVisibility = () => {
    const newVisibility = !showPassword

    setShowPassword(newVisibility)
    onVisibilityChange?.(newVisibility)
  }

  const Icon = showPassword ? EyeOff : Eye
  const toggleLabel = showPassword ? 'Hide password' : 'Show password'

  return (
    <Input
      ref={ref}
      {...props}
      disabled={disabled}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        <button
          type='button'
          onClick={toggleVisibility}
          className='flex h-full cursor-pointer items-center border-none bg-transparent p-0'
          aria-label={toggleAriaLabel || toggleLabel}
          disabled={disabled && props.readOnly !== true}
        >
          <Icon className='size-6 stroke-1 text-muted-foreground' />
        </button>
      }
    />
  )
}
