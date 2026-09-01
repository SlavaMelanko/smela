import { Textarea } from '@ui/components/ui'
import { cn } from '@ui/lib/utils'

import { SvgWrapper } from './SvgWrapper'

const SvgEditorRoot = ({ children, className }) => (
  <div
    className={cn(
      'flex w-full min-w-0 flex-col items-stretch gap-3 md:flex-row',
      className
    )}
  >
    {children}
  </div>
)

const SvgEditorInput = props => (
  <Textarea
    rows={7}
    className='h-full min-w-0 w-full font-mono text-xs md:w-1/2'
    {...props}
  />
)

const SvgEditorPreview = ({ svg, sizes }) => (
  <div className='flex min-w-0 w-full flex-col items-center rounded-md border bg-muted/50 p-3 md:w-1/2'>
    <div className='flex flex-1 flex-wrap items-center justify-center gap-3'>
      {sizes.map(size => (
        <SvgWrapper key={size} svg={svg ?? ''} size={size} />
      ))}
    </div>
    <span className='mt-4 text-center text-xs text-muted-foreground'>
      Same icon shown at {sizes.join('/')}px
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
  <SvgEditorRoot className={className}>
    <SvgEditorInput
      value={value}
      onChange={onChange}
      error={error}
      {...props}
    />
    <SvgEditorPreview svg={value} sizes={previewSizes} />
  </SvgEditorRoot>
)
