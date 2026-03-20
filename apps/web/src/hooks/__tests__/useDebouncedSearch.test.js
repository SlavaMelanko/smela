import { act, renderHook } from '@testing-library/react'

import { useDebouncedSearch } from '../useDebouncedSearch'

jest.mock('@tanstack/react-pacer', () => ({
  useDebouncedValue: value => [value]
}))

describe('useDebouncedSearch', () => {
  it('returns urlValue as initial searchValue', () => {
    const onSearch = jest.fn()
    const { result } = renderHook(() => useDebouncedSearch('initial', onSearch))

    expect(result.current.searchValue).toBe('initial')
  })

  it('updates searchValue when setSearchValue is called', () => {
    const onSearch = jest.fn()
    const { result } = renderHook(() => useDebouncedSearch('', onSearch))

    act(() => {
      result.current.setSearchValue('new value')
    })

    expect(result.current.searchValue).toBe('new value')
  })

  it('calls onSearch with new value after debounce', () => {
    const onSearch = jest.fn()
    const { result } = renderHook(() => useDebouncedSearch('', onSearch))

    act(() => {
      result.current.setSearchValue('search term')
    })

    expect(onSearch).toHaveBeenCalledWith('search term')
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('does not call onSearch when initial value equals urlValue', () => {
    const onSearch = jest.fn()

    renderHook(() => useDebouncedSearch('same', onSearch))

    expect(onSearch).not.toHaveBeenCalled()
  })

  it('syncs searchValue when urlValue changes externally', () => {
    const onSearch = jest.fn()
    const { result, rerender } = renderHook(
      ({ urlValue }) => useDebouncedSearch(urlValue, onSearch),
      { initialProps: { urlValue: 'initial' } }
    )

    expect(result.current.searchValue).toBe('initial')

    rerender({ urlValue: 'from-url' })

    expect(result.current.searchValue).toBe('from-url')
  })

  it('does not call onSearch when urlValue changes to match current value', () => {
    const onSearch = jest.fn()
    const { rerender } = renderHook(
      ({ urlValue }) => useDebouncedSearch(urlValue, onSearch),
      { initialProps: { urlValue: 'test' } }
    )

    onSearch.mockClear()

    rerender({ urlValue: 'test' })

    expect(onSearch).not.toHaveBeenCalled()
  })

  it('does not overwrite user input when URL updates from our own onSearch', () => {
    const onSearch = jest.fn()
    const { result, rerender } = renderHook(
      ({ urlValue }) => useDebouncedSearch(urlValue, onSearch),
      { initialProps: { urlValue: '' } }
    )

    // User types 'q', debounce fires, onSearch('q') updates URL
    act(() => {
      result.current.setSearchValue('q')
    })

    expect(onSearch).toHaveBeenCalledWith('q')

    // URL updates to 'q' from our own onSearch call — should NOT reset input
    rerender({ urlValue: 'q' })
    expect(result.current.searchValue).toBe('q')

    // User continues typing, now 'qw'
    act(() => {
      result.current.setSearchValue('qw')
    })

    // URL still at 'q' but input is 'qw' — input should remain 'qw'
    expect(result.current.searchValue).toBe('qw')
  })

  it('syncs from URL on external changes like browser back/forward', () => {
    const onSearch = jest.fn()
    const { result, rerender } = renderHook(
      ({ urlValue }) => useDebouncedSearch(urlValue, onSearch),
      { initialProps: { urlValue: 'initial' } }
    )

    // Simulate browser back/forward changing URL to something unexpected
    rerender({ urlValue: 'external-navigation' })

    // Should sync because this is an external change
    expect(result.current.searchValue).toBe('external-navigation')
  })
})
