import { Textarea } from '@ui/components/ui'
import { cn } from '@ui/lib/utils'

import { SvgWrapper } from './SvgWrapper'

export const SvgEditor = ({
  value,
  onChange,
  previewSize = [16, 24, 32, 48],
  className,
  error,
  ...props
}) => (
  <div className={cn('flex w-full items-stretch gap-3', className)}>
    <Textarea
      value={value}
      onChange={onChange}
      error={error}
      rows={8}
      className='h-full w-1/2 font-mono text-xs'
      {...props}
    />
    <div className='flex w-1/2 flex-col items-center rounded-md border bg-muted/50 p-3'>
      <div className='flex flex-1 items-center gap-3'>
        {previewSize.map(size => (
          <SvgWrapper key={size} svg={value ?? ''} size={size} />
        ))}
      </div>
      <span className='text-center text-xs text-muted-foreground'>
        Same icon shown at {previewSize.join('/')}px
      </span>
    </div>
  </div>
)
