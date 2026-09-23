import { useTable } from '@tanstack/react-table'
import { useColumnVisibility } from '@ui/hooks/useColumnVisibility'

// Wraps useTable with the options shared by every table: persisted column
// visibility (keyed by tableId) and live column resizing.
export const useTableConfig = (tableId, { columns, state, ...options }) => {
  const [columnVisibility, setColumnVisibility] = useColumnVisibility(
    tableId,
    columns
  )

  return useTable({
    columns,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    state: { ...state, columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    ...options
  })
}
