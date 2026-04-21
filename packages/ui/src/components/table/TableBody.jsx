import { flexRender } from '@tanstack/react-table'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  TableBody as TableBodyRoot,
  TableCell,
  TableRow
} from '@ui/components/ui'
import { cn } from '@ui/lib/utils'

const RowCells = ({ row }) =>
  row.getVisibleCells().map(cell => (
    <TableCell key={cell.id} className='text-center'>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  ))

const MenuItem = ({ item, row }) => {
  if (item.items) {
    const visibleSubitems = item.items.filter(
      subitem => subitem.isVisible?.(row.original) ?? true
    )

    if (!visibleSubitems.length) {
      return null
    }

    return (
      <ContextMenuSub>
        <ContextMenuSubTrigger className='gap-2'>
          {item.icon && <item.icon className='size-4' />}
          {item.label}
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          {visibleSubitems.map((subitem, index) => (
            <div key={subitem.label}>
              {subitem.variant === 'destructive' && index > 0 && (
                <ContextMenuSeparator />
              )}
              <ContextMenuItem
                variant={subitem.variant}
                disabled={subitem.disabled}
                onClick={() => subitem.onClick(row.original)}
              >
                {subitem.icon && <subitem.icon className='size-4' />}
                {subitem.label}
              </ContextMenuItem>
            </div>
          ))}
        </ContextMenuSubContent>
      </ContextMenuSub>
    )
  }

  return (
    <ContextMenuItem
      variant={item.variant}
      disabled={item.disabled}
      onClick={() => item.onClick(row.original)}
    >
      {item.icon && <item.icon className='size-4' />}
      {item.label}
    </ContextMenuItem>
  )
}

const TableRowContent = ({ row, onRowClick, contextMenu }) => {
  const visibleItems = contextMenu?.filter(
    item => item.isVisible?.(row.original) ?? true
  )

  const rowProps = {
    className: cn(onRowClick && 'cursor-pointer'),
    onClick: onRowClick ? () => onRowClick(row.original) : undefined
  }

  if (!visibleItems?.length) {
    return (
      <TableRow {...rowProps}>
        <RowCells row={row} />
      </TableRow>
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger render={<TableRow {...rowProps} />}>
        <RowCells row={row} />
      </ContextMenuTrigger>
      <ContextMenuContent>
        {visibleItems.map((item, index) => (
          <div key={item.label}>
            {item.variant === 'destructive' && index > 0 && (
              <ContextMenuSeparator />
            )}
            <MenuItem item={item} row={row} />
          </div>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}

export const TableBody = ({ config, onRowClick, contextMenu }) => (
  <TableBodyRoot>
    {config.getRowModel().rows.map(row => (
      <TableRowContent
        key={row.id}
        row={row}
        onRowClick={onRowClick}
        contextMenu={contextMenu}
      />
    ))}
  </TableBodyRoot>
)
