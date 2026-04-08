const LOCALHOST_PATTERNS = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^http:\/\/\[::1\](:\d+)?$/,
  /^https:\/\/localhost(:\d+)?$/
]

export const isLocalhost = (origin: string): boolean => {
  return LOCALHOST_PATTERNS.some(pattern => pattern.test(origin))
}

export const isHttps = (url: string): boolean => {
  return url.startsWith('https://')
}

export const parseOrigin = (origin: string): URL | null => {
  try {
    return new URL(origin)
  } catch {
    return null
  }
}

export const normalizeOrigin = (origin: string): string => {
  const parsed = parseOrigin(origin.trim())
  if (!parsed) {
    return origin.trim()
  }

  // Return origin without path, just protocol + host + port
  return parsed.origin.toLowerCase()
}

export const isValidOrigin = (origin: string): boolean => {
  return parseOrigin(origin) !== null
}

const TRAILING_SLASH_RE = /\/$/

export const removeTrailingSlash = (url: string): string => {
  return url.replace(TRAILING_SLASH_RE, '')
}

export const makeUrl = (baseUrl: string, path: string): string => {
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}
