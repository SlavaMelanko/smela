import { cn } from '@/lib/utils'

export const FormRoot = ({ children, className, ...props }) => (
  <form className={cn('flex flex-col gap-8', className)} {...props}>
    {children}
  </form>
)

export const FormGroup = ({ children, className, legend }) => (
  <fieldset className={cn('rounded-lg border border-border p-4', className)}>
    {legend && (
      <legend className='-mx-2 px-2 text-xs text-muted-foreground'>
        {legend}
      </legend>
    )}
    {children}
  </fieldset>
)

export const FormRow = ({ children, className, forceColumns = false }) => (
  <div
    className={cn(
      'grid gap-x-6 gap-y-4',
      forceColumns ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2',
      className
    )}
  >
    {children}
  </div>
)

export const FormFields = ({ children, className }) => (
  <div className={cn('flex flex-col gap-4', className)}>{children}</div>
)

export const FormLabel = ({ htmlFor, children, optional, className }) => (
  <label
    htmlFor={htmlFor}
    className={cn(
      'block cursor-pointer text-base leading-normal text-muted-foreground',
      className
    )}
  >
    {children}
    {!optional && (
      <>
        <span aria-hidden='true' className='ml-1 text-destructive'>
          *
        </span>
        <span className='sr-only'>required</span>
      </>
    )}
  </label>
)

export const FormFieldWrapper = ({ children, hasError, className }) => (
  <div className={cn('relative flex flex-col', hasError && 'mb-4', className)}>
    {children}
  </div>
)

export const FormInputWrapper = ({ children }) => (
  <div className='flex w-full flex-col'>{children}</div>
)

export const FormReadOnly = ({ children }) => (
  <div className='flex h-11 items-center text-base'>{children}</div>
)

export const FormError = ({ message, className }) => (
  <div
    className={cn(
      'absolute top-full overflow-hidden whitespace-nowrap text-sm text-destructive transition-all duration-200',
      message ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
      className
    )}
    role={message ? 'alert' : undefined}
    aria-live='polite'
  >
    {message}
  </div>
)

export const FormActions = ({ children, isDirty }) => (
  <div className={cn('flex justify-end', !isDirty && 'hidden')}>{children}</div>
)
