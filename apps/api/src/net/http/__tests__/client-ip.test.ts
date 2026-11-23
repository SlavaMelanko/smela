import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { Hono } from 'hono'

import { getClientIp } from '../client-ip'

const createApp = (trustedProxyCount?: number) =>
  new Hono().get('/ip', c =>
    c.json({ ip: getClientIp(c, trustedProxyCount) ?? null })
  )

const requestIp = async (app: Hono, forwardedFor?: string) => {
  const headers = forwardedFor ? { 'X-Forwarded-For': forwardedFor } : undefined
  const res = await app.request('/ip', { headers })
  const { ip } = (await res.json()) as { ip: string | null }

  return ip
}

describe('getClientIp', () => {
  describe('without trusted proxies', () => {
    let server: ReturnType<typeof Bun.serve>

    beforeAll(() => {
      server = Bun.serve({ port: 0, fetch: createApp().fetch })
    })

    afterAll(async () => server.stop(true))

    it('uses the socket address and ignores spoofed X-Forwarded-For', async () => {
      const res = await fetch(new URL('/ip', server.url), {
        headers: { 'X-Forwarded-For': '203.0.113.7' }
      })
      const { ip } = await res.json()

      expect(ip).not.toBe('203.0.113.7')
      expect(ip).toMatch(/^(::1|127\.0\.0\.1|::ffff:127\.0\.0\.1)$/)
    })

    it('returns undefined when there is no Bun server', async () => {
      expect(await requestIp(createApp(0), '203.0.113.7')).toBeNull()
    })
  })

  describe('with trusted proxies', () => {
    it('takes the entry appended by the single trusted proxy', async () => {
      const app = createApp(1)

      expect(await requestIp(app, '198.51.100.1, 203.0.113.7')).toBe(
        '203.0.113.7'
      )
    })

    it('skips entries appended by inner proxies', async () => {
      const app = createApp(2)

      expect(await requestIp(app, '198.51.100.1, 203.0.113.7, 10.0.0.2')).toBe(
        '203.0.113.7'
      )
    })

    it('falls back to the left-most entry when the chain is shorter', async () => {
      const app = createApp(3)

      expect(await requestIp(app, ' 203.0.113.7 , 10.0.0.2')).toBe(
        '203.0.113.7'
      )
    })

    it('falls back to the socket address when the header is missing', async () => {
      expect(await requestIp(createApp(1))).toBeNull()
    })
  })
})
