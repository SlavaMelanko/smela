import { act, renderHook, waitFor } from '@testing-library/react'
import { LocaleProvider } from '@ui/contexts/LocaleContext'
import { ToastProvider } from '@ui/contexts/ToastContext'
import i18n from 'i18next'

import { useCopyToClipboard } from '../useCopyToClipboard'

const wrapper = ({ children }) => (
  <LocaleProvider i18n={i18n}>
    <ToastProvider>{children}</ToastProvider>
  </LocaleProvider>
)

describe('useCopyToClipboard', () => {
  const writeText = vi.fn()

  beforeEach(() => {
    writeText.mockReset().mockResolvedValue()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })
  })

  it('sets copied after copying, then resets after the timeout', async () => {
    const { result } = renderHook(() => useCopyToClipboard(100), { wrapper })

    await act(() => result.current.copy('hello'))

    expect(writeText).toHaveBeenCalledWith('hello')
    expect(result.current.copied).toBe(true)

    await waitFor(() => expect(result.current.copied).toBe(false))
  })

  it('keeps copied false when clipboard write fails', async () => {
    writeText.mockRejectedValue(new Error('denied'))

    const { result } = renderHook(() => useCopyToClipboard(100), { wrapper })

    await act(() => result.current.copy('hello'))

    expect(result.current.copied).toBe(false)
  })
})
