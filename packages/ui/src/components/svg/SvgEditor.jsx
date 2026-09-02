import { Textarea } from '@ui/components/ui'
import { cn } from '@ui/lib/utils'

import { SvgWrapper } from './SvgWrapper'

const SvgEditorPreview = ({ svg, sizes }) => (
  <div className='flex flex-col items-center gap-4 rounded-md border bg-muted/50 p-3'>
    <div className='flex flex-1 flex-wrap items-center justify-center gap-3'>
      {sizes.map(size => (
        <SvgWrapper key={size} svg={svg ?? ''} size={size} />
      ))}
    </div>
    <span className='text-center text-xs text-muted-foreground'>
      {sizes.join('/')}px
    </span>
  </div>
)

export const SvgEditor = ({
  value,
  onChange,
  previewSizes = [16, 24, 32, 48],
  className,
  error,
  ...props
}) => (
  <div className={cn('grid w-full gap-3 md:grid-cols-2', className)}>
    <Textarea
      rows={7}
      className='font-mono text-xs'
      value={value}
      onChange={onChange}
      error={error}
      {...props}
    />
    <SvgEditorPreview svg={value} sizes={previewSizes} />
  </div>
)
