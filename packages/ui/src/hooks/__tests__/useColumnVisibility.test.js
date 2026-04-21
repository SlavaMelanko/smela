import { act, renderHook } from '@testing-library/react'

import { useColumnVisibility } from '../useColumnVisibility'

const columns = [
  { accessorKey: 'id', hidden: true },
  { accessorKey: 'name' },
  { accessorKey: 'email' },
  { accessorKey: 'updatedAt', hidden: true }
]

const defaults = { id: false, name: true, email: true, updatedAt: false }

describe('useColumnVisibility', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('initializes with defaults derived from column definitions', () => {
    const { result } = renderHook(() => useColumnVisibility('test', columns))

    expect(result.current[0]).toEqual(defaults)
  })

  it('updates visibility when setter is called', () => {
    const { result } = renderHook(() => useColumnVisibility('test', columns))

    act(() => {
      result.current[1]({ ...defaults, id: true })
    })

    expect(result.current[0].id).toBe(true)
  })

  it('persists only diff from defaults to localStorage', () => {
    const { result } = renderHook(() => useColumnVisibility('test', columns))

    act(() => {
      result.current[1]({ ...defaults, id: true })
    })

    const stored = JSON.parse(window.localStorage.getItem('table:columns:test'))

    expect(stored).toEqual({ id: true })
  })

  it('removes localStorage key when visibility reverts to defaults', () => {
    const { result } = renderHook(() => useColumnVisibility('test', columns))

    act(() => {
      result.current[1]({ ...defaults, id: true })
    })

    act(() => {
      result.current[1](defaults)
    })

    expect(window.localStorage.getItem('table:columns:test')).toBeNull()
  })

  it('restores visibility from localStorage on mount', () => {
    window.localStorage.setItem(
      'table:columns:test',
      JSON.stringify({ id: true })
    )

    const { result } = renderHook(() => useColumnVisibility('test', columns))

    expect(result.current[0]).toEqual({ ...defaults, id: true })
  })

  it('supports updater function as argument', () => {
    const { result } = renderHook(() => useColumnVisibility('test', columns))

    act(() => {
      result.current[1](prev => ({ ...prev, id: true }))
    })

    expect(result.current[0].id).toBe(true)
  })

  it('falls back to defaults when localStorage contains invalid JSON', () => {
    window.localStorage.setItem('table:columns:test', 'not-json')

    const { result } = renderHook(() => useColumnVisibility('test', columns))

    expect(result.current[0]).toEqual(defaults)
  })
})
