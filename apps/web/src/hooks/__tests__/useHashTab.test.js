import { act, renderHook } from '@testing-library/react'

import { useHashTab } from '../useHashTab'

const mockNavigate = jest.fn()
let mockLocation = { pathname: '/test', search: '', hash: '' }

jest.mock('react-router-dom', () => ({
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate
}))

describe('useHashTab', () => {
  const validValues = ['tab1', 'tab2', 'tab3']
  const defaultValue = 'tab1'

  beforeEach(() => {
    mockNavigate.mockClear()
    mockLocation = { pathname: '/test', search: '', hash: '' }
  })

  it('returns defaultValue when hash is empty', () => {
    const { result } = renderHook(() => useHashTab(validValues, defaultValue))

    expect(result.current[0]).toBe('tab1')
  })

  it('returns defaultValue when hash is not in validValues', () => {
    mockLocation = { pathname: '/test', search: '', hash: '#invalid' }

    const { result } = renderHook(() => useHashTab(validValues, defaultValue))

    expect(result.current[0]).toBe('tab1')
  })

  it('returns hash value when it is in validValues', () => {
    mockLocation = { pathname: '/test', search: '', hash: '#tab2' }

    const { result } = renderHook(() => useHashTab(validValues, defaultValue))

    expect(result.current[0]).toBe('tab2')
  })

  it('navigates with hash only when no pathname or search exists', () => {
    mockLocation = { pathname: '', search: '', hash: '' }
    const { result } = renderHook(() => useHashTab(validValues, defaultValue))

    act(() => {
      result.current[1]('tab3')
    })

    expect(mockNavigate).toHaveBeenCalledWith(
      { pathname: '', search: '', hash: '#tab3' },
      { replace: true }
    )
  })

  it('preserves pathname when setting new hash', () => {
    mockLocation = { pathname: '/admin/users', search: '', hash: '#tab1' }
    const { result } = renderHook(() => useHashTab(validValues, defaultValue))

    act(() => {
      result.current[1]('tab2')
    })

    expect(mockNavigate).toHaveBeenCalledWith(
      { pathname: '/admin/users', search: '', hash: '#tab2' },
      { replace: true }
    )
  })

  it('preserves search params when setting new hash', () => {
    mockLocation = { pathname: '/test', search: '?page=2&limit=10', hash: '' }
    const { result } = renderHook(() => useHashTab(validValues, defaultValue))

    act(() => {
      result.current[1]('tab2')
    })

    expect(mockNavigate).toHaveBeenCalledWith(
      { pathname: '/test', search: '?page=2&limit=10', hash: '#tab2' },
      { replace: true }
    )
  })

  it('preserves both pathname and search when setting new hash', () => {
    mockLocation = {
      pathname: '/admin/teams',
      search: '?filter=active',
      hash: '#tab1'
    }

    const { result } = renderHook(() => useHashTab(validValues, defaultValue))

    act(() => {
      result.current[1]('tab3')
    })

    expect(mockNavigate).toHaveBeenCalledWith(
      { pathname: '/admin/teams', search: '?filter=active', hash: '#tab3' },
      { replace: true }
    )
  })
})
