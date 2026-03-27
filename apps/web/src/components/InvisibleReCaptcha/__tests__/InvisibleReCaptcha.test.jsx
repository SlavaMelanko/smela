import { render } from '@testing-library/react'
import { createRef } from 'react'

const mockExecuteAsync = vi.fn()
const mockReset = vi.fn()

// Must unmock the component since setup.js mocks it globally
vi.unmock('@/components/InvisibleReCaptcha')

vi.mock('react-google-recaptcha', async () => {
  const React = await vi.importActual('react')

  function MockReCAPTCHA({ ref }) {
    React.useImperativeHandle(ref, () => ({
      executeAsync: mockExecuteAsync,
      reset: mockReset
    }))

    return null
  }

  return { __esModule: true, default: MockReCAPTCHA }
})

const mockWithTimeout = vi.fn()

vi.mock('@/lib/async', () => ({
  withTimeout: (...args) => mockWithTimeout(...args)
}))

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'dark' })
}))

vi.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ locale: 'uk' })
}))

import { InvisibleReCaptcha } from '../InvisibleReCaptcha'

describe('InvisibleReCaptcha', () => {
  let recaptchaRef

  beforeEach(() => {
    recaptchaRef = createRef()
    vi.clearAllMocks()
  })

  describe('imperative handle', () => {
    it('exposes executeAsync and reset methods', () => {
      render(<InvisibleReCaptcha ref={recaptchaRef} />)

      expect(typeof recaptchaRef.current.executeAsync).toBe('function')
      expect(typeof recaptchaRef.current.reset).toBe('function')
    })
  })

  describe('executeAsync', () => {
    it('resets, executes, and returns token on success', async () => {
      mockWithTimeout.mockImplementation(fn => fn())
      mockExecuteAsync.mockResolvedValue('token-123')

      render(<InvisibleReCaptcha ref={recaptchaRef} />)

      const token = await recaptchaRef.current.executeAsync()

      expect(mockReset).toHaveBeenCalledTimes(1)
      expect(mockWithTimeout).toHaveBeenCalled()
      expect(token).toBe('token-123')
    })

    it('returns empty string on timeout error', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation()

      mockWithTimeout.mockRejectedValue(new Error('Operation timed out'))

      render(<InvisibleReCaptcha ref={recaptchaRef} />)

      const token = await recaptchaRef.current.executeAsync()

      expect(consoleError).toHaveBeenCalledWith(
        'reCAPTCHA error:',
        'Operation timed out'
      )

      expect(token).toBe('')

      consoleError.mockRestore()
    })

    it('handles error without message gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation()

      mockWithTimeout.mockRejectedValue({})

      render(<InvisibleReCaptcha ref={recaptchaRef} />)

      const token = await recaptchaRef.current.executeAsync()

      expect(consoleError).toHaveBeenCalledWith('reCAPTCHA error:', 'Unknown.')
      expect(token).toBe('')

      consoleError.mockRestore()
    })
  })

  describe('reset', () => {
    it('calls underlying reset method', () => {
      render(<InvisibleReCaptcha ref={recaptchaRef} />)

      recaptchaRef.current.reset()

      expect(mockReset).toHaveBeenCalledTimes(1)
    })
  })
})
