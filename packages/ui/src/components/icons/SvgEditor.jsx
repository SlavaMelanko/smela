import { Textarea } from '@ui/components/ui'
import { cn } from '@ui/lib/utils'

import { SvgWrapper } from './SvgWrapper'

const SvgEditorRoot = ({ children, className }) => (
  <div className={cn('flex w-full items-stretch gap-3', className)}>
    {children}
  </div>
)

const SvgEditorInput = props => (
  <Textarea rows={8} className='h-full w-1/2 font-mono text-xs' {...props} />
)

const SvgEditorPreview = ({ svg, sizes }) => (
  <div className='flex w-1/2 flex-col items-center rounded-md border bg-muted/50 p-3'>
    <div className='flex flex-1 items-center gap-3'>
      {sizes.map(size => (
        <SvgWrapper key={size} svg={svg ?? ''} size={size} />
      ))}
    </div>
    <span className='text-center text-xs text-muted-foreground'>
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
