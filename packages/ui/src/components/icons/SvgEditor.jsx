import { Textarea } from '@ui/components/ui'
import { cn } from '@ui/lib/utils'

import { SvgWrapper } from './SvgWrapper'

export const SvgEditor = ({
  value,
  onChange,
  previewSize = 32,
  className,
  error,
  ...props
}) => (
  <div className={cn('flex w-full items-stretch gap-3', className)}>
    <Textarea
      value={value}
      onChange={onChange}
      error={error}
      rows={10}
      className='h-full w-4/5 font-mono text-xs'
      {...props}
    />
    <div className='flex w-1/5 items-center justify-center rounded-md border bg-muted/50'>
      <SvgWrapper svg={value ?? ''} size={previewSize} />
    </div>
  </div>
)
