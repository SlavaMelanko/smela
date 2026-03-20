import { act, renderHook } from '@testing-library/react'
import { useSearchParams } from 'react-router-dom'

import { Limit } from '@/components/Pagination'

import { useDebouncedSearch } from '../useDebouncedSearch'
import { useTableState } from '../useTableState'

jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn()
}))

jest.mock('../useDebouncedSearch', () => ({
  useDebouncedSearch: jest.fn()
}))

describe('useTableState', () => {
  let mockSearchParams
  let mockSetSearchParams

  beforeEach(() => {
    useDebouncedSearch.mockReturnValue({
      searchValue: '',
      setSearchValue: jest.fn()
    })

    mockSearchParams = new URLSearchParams()
    mockSetSearchParams = jest.fn(updater => {
      if (typeof updater === 'function') {
        mockSearchParams = updater(mockSearchParams)
      } else {
        mockSearchParams = updater
      }
    })

    useSearchParams.mockReturnValue([mockSearchParams, mockSetSearchParams])
  })

  it('returns default values when URL has no params (Admins table scenario)', () => {
    const { result } = renderHook(() => useTableState())

    expect(result.current.params).toEqual({
      search: '',
      statuses: [],
      page: 1,
      limit: Limit.SM
    })

    expect(result.current.apiParams).toEqual({
      page: 1,
      limit: Limit.SM
    })
  })

  it('parses all params from URL (Users table scenario)', () => {
    mockSearchParams = new URLSearchParams(
      'search=john&statuses=active,pending&page=2&limit=50'
    )

    useSearchParams.mockReturnValue([mockSearchParams, mockSetSearchParams])

    const { result } = renderHook(() => useTableState())

    expect(result.current.params).toEqual({
      search: 'john',
      statuses: ['active', 'pending'],
      page: 2,
      limit: 50
    })

    expect(result.current.apiParams).toEqual({
      search: 'john',
      statuses: 'active,pending',
      page: 2,
      limit: 50
    })
  })

  it('updates page param without resetting (pagination)', () => {
    const { result } = renderHook(() => useTableState())

    act(() => {
      result.current.setParams({ page: 3 })
    })

    expect(mockSetSearchParams).toHaveBeenCalledTimes(1)
    expect(mockSearchParams.get('page')).toBe('3')
  })

  it('resets page when resetPage option is true (filter change)', () => {
    mockSearchParams = new URLSearchParams('page=5&statuses=active')
    useSearchParams.mockReturnValue([mockSearchParams, mockSetSearchParams])

    const { result } = renderHook(() => useTableState())

    act(() => {
      result.current.setParams({ statuses: ['pending'] }, { resetPage: true })
    })

    expect(mockSearchParams.get('page')).toBeNull()
    expect(mockSearchParams.get('statuses')).toBe('pending')
  })

  it('removes empty values from URL', () => {
    mockSearchParams = new URLSearchParams('search=test&statuses=active')
    useSearchParams.mockReturnValue([mockSearchParams, mockSetSearchParams])

    const { result } = renderHook(() => useTableState())

    act(() => {
      result.current.setParams({ search: '', statuses: [] })
    })

    expect(mockSearchParams.get('search')).toBeNull()
    expect(mockSearchParams.get('statuses')).toBeNull()
  })

  it('integrates with useDebouncedSearch correctly', () => {
    const mockSetSearchValue = jest.fn()

    useDebouncedSearch.mockReturnValue({
      searchValue: 'test query',
      setSearchValue: mockSetSearchValue
    })

    const { result } = renderHook(() => useTableState())

    expect(result.current.searchValue).toBe('test query')
    expect(result.current.setSearchValue).toBe(mockSetSearchValue)
    expect(useDebouncedSearch).toHaveBeenCalledWith('', expect.any(Function))
  })
})
