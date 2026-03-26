import { useState } from 'react'

import { localStorage } from '@/lib/storage'

const buildKey = tableId => `table:columns:${tableId}`

const toDefaults = columns =>
  Object.fromEntries(
    columns
      .filter(col => col.accessorKey !== undefined)
      .map(col => [col.accessorKey, col.hidden !== true])
  )

const diffFromDefaults = (visibility, defaults) =>
  Object.fromEntries(
    Object.entries(visibility).filter(([key, value]) => value !== defaults[key])
  )

const loadVisibility = (tableId, defaults) => {
  try {
    const stored = localStorage.get(buildKey(tableId))

    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults
  } catch {
    return defaults
  }
}

export const useColumnVisibility = (tableId, columns) => {
  const defaults = toDefaults(columns)

  const [columnVisibility, setColumnVisibilityState] = useState(() =>
    loadVisibility(tableId, defaults)
  )

  const setColumnVisibility = next => {
    const resolved = typeof next === 'function' ? next(columnVisibility) : next

    setColumnVisibilityState(resolved)

    const diff = diffFromDefaults(resolved, defaults)

    if (Object.keys(diff).length === 0) {
      localStorage.remove(buildKey(tableId))
    } else {
      localStorage.set(buildKey(tableId), JSON.stringify(diff))
    }
  }

  return [columnVisibility, setColumnVisibility]
}
