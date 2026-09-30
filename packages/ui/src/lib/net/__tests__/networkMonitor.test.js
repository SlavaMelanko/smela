import {
  getNetworkErrorType,
  isNetworkError,
  NetworkErrorType
} from '../networkMonitor'

const setOnline = value =>
  Object.defineProperty(navigator, 'onLine', { writable: true, value })

describe('networkMonitor', () => {
  beforeEach(() => setOnline(true))

  describe('isNetworkError', () => {
    it.each([
      ['message', { message: 'Failed to fetch' }],
      ['lowercase message', { message: 'network request failed' }],
      ['code', { code: 'ECONNREFUSED' }],
      ['lowercase code', { code: 'econnrefused' }],
      ['name', { name: 'NetworkError' }],
      ['fetch TypeError', new TypeError('Failed to fetch')],
      ...[0, 502, 503, 504].map(status => [`status ${status}`, { status }])
    ])('should detect network error by %s', (_, error) => {
      expect(isNetworkError(error)).toBe(true)
    })

    it.each([
      ['null', null],
      ['undefined', undefined],
      [
        'generic TypeError',
        { name: 'TypeError', message: 'Illegal invocation' }
      ],
      ['client error', { message: 'Validation error', status: 400 }],
      ['server error', { status: 500 }]
    ])('should ignore %s', (_, error) => {
      expect(isNetworkError(error)).toBe(false)
    })

    it('should treat any error as network error when offline', () => {
      setOnline(false)

      expect(isNetworkError({})).toBe(true)
    })
  })

  describe('getNetworkErrorType', () => {
    it.each([
      [{ message: 'Connection refused' }, NetworkErrorType.CONNECTION_REFUSED],
      [{ code: 'ECONNREFUSED' }, NetworkErrorType.CONNECTION_REFUSED],
      [{ message: 'Connection timeout' }, NetworkErrorType.TIMEOUT],
      [{ code: 'ETIMEDOUT' }, NetworkErrorType.TIMEOUT],
      [{ message: 'Name not resolved' }, NetworkErrorType.NAME_NOT_RESOLVED],
      [{ code: 'ENOTFOUND' }, NetworkErrorType.NAME_NOT_RESOLVED],
      [{ status: 0 }, NetworkErrorType.SERVER_UNAVAILABLE],
      [{ status: 502 }, NetworkErrorType.SERVER_UNAVAILABLE],
      [{ message: 'Failed to fetch' }, NetworkErrorType.SERVER_UNAVAILABLE],
      [{ message: 'NetworkError' }, NetworkErrorType.SERVER_UNAVAILABLE],
      [{ message: 'Some other error' }, NetworkErrorType.UNKNOWN],
      [null, NetworkErrorType.UNKNOWN]
    ])('should classify %o as %s', (error, type) => {
      expect(getNetworkErrorType(error)).toBe(type)
    })

    it('should return OFFLINE when browser is offline', () => {
      setOnline(false)

      expect(getNetworkErrorType({})).toBe(NetworkErrorType.OFFLINE)
    })
  })
})
