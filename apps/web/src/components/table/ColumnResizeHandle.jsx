import { cn } from '@/lib/utils'

export const ColumnResizeHandle = ({ header }) => (
  <div
    role='separator'
    tabIndex={0}
    aria-label='Resize column'
    aria-orientation='vertical'
    onDoubleClick={e => {
      e.stopPropagation()
      header.column.resetSize()
    }}
    onMouseDown={e => {
      e.stopPropagation()
      header.getResizeHandler()(e)
    }}
    onTouchStart={e => {
      e.stopPropagation()
      header.getResizeHandler()(e)
    }}
    onKeyDown={e => {
      e.stopPropagation()

      if (e.key === 'Enter' || e.key === ' ') {
        header.column.resetSize()
      }
    }}
    className={cn(
      'absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none rounded-full opacity-0 transition-opacity hover:bg-border hover:opacity-100',
      header.column.getIsResizing() && 'bg-primary opacity-100'
    )}
  />
)
