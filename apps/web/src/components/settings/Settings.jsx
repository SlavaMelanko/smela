import { Check } from 'lucide-react'
import { useId } from 'react'

import { cn } from '@/lib/utils'

export const SettingsSection = ({ children }) => (
  <section className='flex flex-col gap-4'>{children}</section>
)

export const SettingsLabel = ({ icon: Icon, children }) => (
  <div className='flex items-center gap-2'>
    <Icon className='size-4 text-muted-foreground' />
    <span className='text-base leading-normal text-muted-foreground'>
      {children}
    </span>
  </div>
)

export const SettingsOptions = ({
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby
}) => (
  <div
    role='radiogroup'
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledby}
    className='flex flex-wrap gap-2 lg:gap-4'
  >
    {children}
  </div>
)

export const SettingsOption = ({ selected, onClick, label, description }) => {
  const id = useId()
  const descId = `${id}-desc`

  return (
    <button
      onClick={onClick}
      role='radio'
      aria-checked={selected}
      aria-describedby={description ? descId : undefined}
      className={cn(
        'group relative flex min-w-60 flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border px-4 py-4 transition-all duration-200',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-muted-foreground/30 hover:bg-accent/50'
      )}
    >
      <span className='text-lg font-normal tracking-tight text-foreground'>
        {label}
      </span>
      {description && (
        <span id={descId} className='text-xs text-muted-foreground'>
          {description}
        </span>
      )}
      {selected && (
        <div className='absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground'>
          <Check className='size-3' />
        </div>
      )}
    </button>
  )
}
