import { flexRender } from '@tanstack/react-table'
import { ChevronDown, ChevronUp } from 'lucide-react'

import {
  TableHead,
  TableHeader as TableHeaderRoot,
  TableRow
} from '@/components/ui'

import { ColumnResizeHandle } from './ColumnResizeHandle'

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
              <ColumnResizeHandle header={header} />
            </TableHead>
          )
        })}
      </TableRow>
    ))}
  </TableHeaderRoot>
)
