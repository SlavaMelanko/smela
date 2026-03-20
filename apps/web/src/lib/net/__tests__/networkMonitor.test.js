import {
  getNetworkErrorType,
  isNetworkError,
  NetworkErrorType
} from '../networkMonitor'

describe('network-monitor', () => {
  beforeEach(() => {
    // Reset navigator.onLine before each test
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    })
  })

  describe('isNetworkError', () => {
    it('should return false for null or undefined error', () => {
      expect(isNetworkError(null)).toBe(false)
      expect(isNetworkError(undefined)).toBe(false)
    })

    it('should return true when browser is offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })

      expect(isNetworkError({})).toBe(true)
    })

    it('should detect generic network errors in message', () => {
      const error = { message: 'Failed to fetch' }

      expect(isNetworkError(error)).toBe(true)
    })

    it('should be case insensitive for message detection', () => {
      const error = { message: 'network request failed' }

      expect(isNetworkError(error)).toBe(true)
    })

    it('should detect network errors in error code', () => {
      const error = { code: 'ECONNREFUSED' }

      expect(isNetworkError(error)).toBe(true)
    })

    it('should handle lowercase error codes', () => {
      const error = { code: 'econnrefused' }

      expect(isNetworkError(error)).toBe(true)
    })

    it('should detect NetworkError by name', () => {
      const error = { name: 'NetworkError' }

      expect(isNetworkError(error)).toBe(true)
    })

    it('should not detect generic TypeError as network error', () => {
      const error = { name: 'TypeError', message: 'Illegal invocation' }

      expect(isNetworkError(error)).toBe(false)
    })

    it('should detect network error status codes', () => {
      expect(isNetworkError({ status: 0 })).toBe(true)
      expect(isNetworkError({ status: 502 })).toBe(true)
      expect(isNetworkError({ status: 503 })).toBe(true)
      expect(isNetworkError({ status: 504 })).toBe(true)
    })

    it('should detect network errors in response status', () => {
      const error = { response: { status: 502 } }

      expect(isNetworkError(error)).toBe(true)
    })

    it('should detect axios network errors', () => {
      const error = {
        isAxiosError: true,
        code: 'ECONNABORTED'
      }

      expect(isNetworkError(error)).toBe(true)
    })

    it('should detect fetch TypeError', () => {
      const error = new TypeError('Failed to fetch')

      expect(isNetworkError(error)).toBe(true)
    })

    it('should return false for non-network errors', () => {
      const error = { message: 'Validation error', status: 400 }

      expect(isNetworkError(error)).toBe(false)
    })

    it('should return false for server errors that are not network related', () => {
      const error = { status: 500 }

      expect(isNetworkError(error)).toBe(false)
    })
  })

  describe('getNetworkErrorType', () => {
    it('should return OFFLINE when navigator is offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })

      expect(getNetworkErrorType({})).toBe(NetworkErrorType.OFFLINE)
    })

    it('should return UNKNOWN for null error', () => {
      expect(getNetworkErrorType(null)).toBe(NetworkErrorType.UNKNOWN)
    })

    it('should detect CONNECTION_REFUSED errors', () => {
      expect(getNetworkErrorType({ message: 'Connection refused' })).toBe(
        NetworkErrorType.CONNECTION_REFUSED
      )

      expect(getNetworkErrorType({ code: 'ECONNREFUSED' })).toBe(
        NetworkErrorType.CONNECTION_REFUSED
      )
    })

    it('should detect TIMEOUT errors', () => {
      expect(getNetworkErrorType({ message: 'Connection timeout' })).toBe(
        NetworkErrorType.TIMEOUT
      )

      expect(getNetworkErrorType({ code: 'ETIMEDOUT' })).toBe(
        NetworkErrorType.TIMEOUT
      )

      expect(getNetworkErrorType({ message: 'Request timeout' })).toBe(
        NetworkErrorType.TIMEOUT
      )
    })

    it('should detect NAME_NOT_RESOLVED errors', () => {
      expect(getNetworkErrorType({ message: 'Name not resolved' })).toBe(
        NetworkErrorType.NAME_NOT_RESOLVED
      )

      expect(getNetworkErrorType({ code: 'ENOTFOUND' })).toBe(
        NetworkErrorType.NAME_NOT_RESOLVED
      )
    })

    it('should detect SERVER_UNAVAILABLE by status code', () => {
      expect(getNetworkErrorType({ status: 502 })).toBe(
        NetworkErrorType.SERVER_UNAVAILABLE
      )

      expect(getNetworkErrorType({ status: 503 })).toBe(
        NetworkErrorType.SERVER_UNAVAILABLE
      )

      expect(getNetworkErrorType({ status: 504 })).toBe(
        NetworkErrorType.SERVER_UNAVAILABLE
      )
    })

    it('should detect SERVER_UNAVAILABLE by message', () => {
      expect(getNetworkErrorType({ message: 'Failed to fetch' })).toBe(
        NetworkErrorType.SERVER_UNAVAILABLE
      )

      expect(getNetworkErrorType({ message: 'NetworkError' })).toBe(
        NetworkErrorType.SERVER_UNAVAILABLE
      )

      expect(getNetworkErrorType({ message: 'Network request failed' })).toBe(
        NetworkErrorType.SERVER_UNAVAILABLE
      )
    })

    it('should return UNKNOWN for unrecognized errors', () => {
      expect(getNetworkErrorType({ message: 'Some other error' })).toBe(
        NetworkErrorType.UNKNOWN
      )
    })
  })
})
