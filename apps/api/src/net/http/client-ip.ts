import type { Context } from 'hono'

import { getConnInfo } from '@hono/bun'

import { env } from '@/env'

// Each proxy appends the address it received the request from, so with N
// trusted proxies the client is the N-th entry from the right. Entries further
// left are client-supplied and can be forged
const getForwardedIp = (c: Context, trustedProxyCount: number) => {
  const forwardedIps =
    c.req
      .header('x-forwarded-for')
      ?.split(',')
      .map(ip => ip.trim())
      .filter(Boolean) ?? []

  return forwardedIps.at(-trustedProxyCount) ?? forwardedIps[0]
}

const getSocketIp = (c: Context) => {
  try {
    return getConnInfo(c).remote.address
  } catch {
    // No Bun server in context, e.g. app.request() in tests
    return undefined
  }
}

export const getClientIp = (
  c: Context,
  trustedProxyCount = env.TRUSTED_PROXY_COUNT
): string | undefined => {
  if (trustedProxyCount > 0) {
    const forwardedIp = getForwardedIp(c, trustedProxyCount)

    if (forwardedIp) {
      return forwardedIp
    }
  }

  return getSocketIp(c)
}
