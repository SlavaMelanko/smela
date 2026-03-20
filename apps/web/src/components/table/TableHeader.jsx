import { flexRender } from '@tanstack/react-table'
import { ChevronDown, ChevronUp } from 'lucide-react'

import {
  TableHead,
  TableHeader as TableHeaderRoot,
  TableRow
} from '@/components/ui'
import { cn } from '@/lib/utils'

export const TableHeader = ({ config }) => (
  <TableHeaderRoot>
    {config.getHeaderGroups().map(headerGroup => (
      <TableRow key={headerGroup.id} className='border hover:bg-transparent'>
        {headerGroup.headers.map(header => {
          const isSorted = header.column.getIsSorted()

          return (
            <TableHead
              key={header.id}
              colSpan={header.colSpan}
              style={{ width: header.getSize?.() ?? 'auto' }}
              aria-sort={isSorted || 'none'}
              className='relative cursor-pointer select-none bg-muted/50 text-center text-base leading-normal text-muted-foreground transition-colors hover:bg-muted'
              onClick={header.column.getToggleSortingHandler?.()}
            >
              <span className='inline-flex items-center gap-1'>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
                {isSorted === 'asc' && <ChevronUp className='size-4' />}
                {isSorted === 'desc' && <ChevronDown className='size-4' />}
              </span>
              <div
                onDoubleClick={() => header.column.resetSize()}
                onMouseDown={header.getResizeHandler()}
                onTouchStart={header.getResizeHandler()}
                className={cn(
                  'absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none rounded-full opacity-0 transition-opacity hover:bg-border hover:opacity-100',
                  header.column.getIsResizing() && 'bg-primary opacity-100'
                )}
              />
            </TableHead>
          )
        })}
      </TableRow>
    ))}
  </TableHeaderRoot>
)
