const NETWORK_ERROR_PATTERNS = [
  'networkerror',
  'network request failed',
  'failed to fetch',
  'load failed',
  'timeout',
  'connection',
  'econnrefused',
  'etimedout',
  'enotfound',
  'econnreset'
]

const NETWORK_ERROR_STATUS_CODES = new Set([
  0, // no response
  502, // bad gateway
  503, // service unavailable
  504 // gateway timeout
])

export const NetworkErrorType = {
  OFFLINE: 'offline',
  CONNECTION_REFUSED: 'connectionRefused',
  TIMEOUT: 'timeout',
  NAME_NOT_RESOLVED: 'nameNotResolved',
  SERVER_UNAVAILABLE: 'serverUnavailable',
  UNKNOWN: 'unknown'
}

// Order matters: first match wins
const ERROR_TYPE_PATTERNS = [
  {
    type: NetworkErrorType.CONNECTION_REFUSED,
    patterns: ['econnrefused', 'connection refused']
  },
  { type: NetworkErrorType.TIMEOUT, patterns: ['etimedout', 'timeout'] },
  {
    type: NetworkErrorType.NAME_NOT_RESOLVED,
    patterns: ['enotfound', 'not resolved']
  }
]

const isOffline = () => typeof navigator !== 'undefined' && !navigator.onLine

const toSearchText = error =>
  [error.message, error.code, error.name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

export const isNetworkError = error => {
  if (!error) {
    return false
  }

  if (isOffline()) {
    return true
  }

  const text = toSearchText(error)

  return (
    NETWORK_ERROR_PATTERNS.some(pattern => text.includes(pattern)) ||
    NETWORK_ERROR_STATUS_CODES.has(error.status)
  )
}

export const getNetworkErrorType = error => {
  if (isOffline()) {
    return NetworkErrorType.OFFLINE
  }

  if (!error) {
    return NetworkErrorType.UNKNOWN
  }

  const text = toSearchText(error)
  const match = ERROR_TYPE_PATTERNS.find(({ patterns }) =>
    patterns.some(pattern => text.includes(pattern))
  )

  if (match) {
    return match.type
  }

  return isNetworkError(error)
    ? NetworkErrorType.SERVER_UNAVAILABLE
    : NetworkErrorType.UNKNOWN
}
