// Common network error patterns
const NETWORK_ERROR_PATTERNS = [
  'NetworkError',
  'Network request failed',
  'Failed to fetch',
  'Load failed',
  'timeout',
  'Connection',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ECONNRESET'
]

// HTTP status codes that indicate network issues
const NETWORK_ERROR_STATUS_CODES = [
  0, // no response
  502, // bad gateway
  503, // service unavailable
  504 // gateway timeout
]

// Determines if an error is a network connection issue
export const isNetworkError = error => {
  if (!error) {
    return false
  }

  // Check if browser is offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true
  }

  // Check error message
  if (error.message) {
    const errorMessage = error.message.toLowerCase()
    const hasNetworkError = NETWORK_ERROR_PATTERNS.some(pattern =>
      errorMessage.includes(pattern.toLowerCase())
    )

    if (hasNetworkError) {
      return true
    }
  }

  // Check error code
  if (error.code) {
    const errorCode = error.code.toString().toUpperCase()
    const hasNetworkCode = NETWORK_ERROR_PATTERNS.some(pattern =>
      errorCode.includes(pattern)
    )

    if (hasNetworkCode) {
      return true
    }
  }

  // Check error name
  if (error.name) {
    const errorName = error.name.toLowerCase()

    if (errorName === 'networkerror') {
      return true
    }
  }

  // Check HTTP status code
  if (error.status !== undefined) {
    if (NETWORK_ERROR_STATUS_CODES.includes(error.status)) {
      return true
    }
  }

  // Check response status for fetch API responses
  if (error.response && error.response.status !== undefined) {
    if (NETWORK_ERROR_STATUS_CODES.includes(error.response.status)) {
      return true
    }
  }

  // Check for axios-specific network errors
  if (error.isAxiosError && error.code) {
    const axiosNetworkCodes = [
      'ECONNABORTED',
      'ERR_NETWORK',
      'ERR_FR_TOO_MANY_REDIRECTS'
    ]

    if (axiosNetworkCodes.includes(error.code)) {
      return true
    }
  }

  // Check for fetch-specific TypeError that often indicates network issues
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return true
  }

  return false
}

export const NetworkErrorType = {
  OFFLINE: 'offline',
  CONNECTION_REFUSED: 'connectionRefused',
  TIMEOUT: 'timeout',
  NAME_NOT_RESOLVED: 'nameNotResolved',
  SERVER_UNAVAILABLE: 'serverUnavailable',
  UNKNOWN: 'unknown'
}

// Gets the network error type from an error object
export const getNetworkErrorType = error => {
  if (!navigator.onLine) {
    return NetworkErrorType.OFFLINE
  }

  if (!error) {
    return NetworkErrorType.UNKNOWN
  }

  const errMsg = (error?.message || error?.code || '').toLowerCase()

  if (
    errMsg.includes('econnrefused') ||
    errMsg.includes('connection refused')
  ) {
    return NetworkErrorType.CONNECTION_REFUSED
  }

  if (errMsg.includes('etimedout') || errMsg.includes('timeout')) {
    return NetworkErrorType.TIMEOUT
  }

  if (errMsg.includes('enotfound') || errMsg.includes('not resolved')) {
    return NetworkErrorType.NAME_NOT_RESOLVED
  }

  if (error.status === 502 || error.status === 503 || error.status === 504) {
    return NetworkErrorType.SERVER_UNAVAILABLE
  }

  if (
    errMsg.includes('failed to fetch') ||
    errMsg.includes('networkerror') ||
    errMsg.includes('network request failed') ||
    errMsg.includes('load failed')
  ) {
    return NetworkErrorType.SERVER_UNAVAILABLE
  }

  return NetworkErrorType.UNKNOWN
}
