import { beforeEach, describe, expect, it } from 'bun:test'
import { Hono } from 'hono'

import { authRateLimiter, generalRateLimiter } from '..'

describe('Rate Limiter Presets', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
  })

  describe('authRateLimiter', () => {
    it('should apply env-appropriate limit and support skip header', async () => {
      app.use(authRateLimiter)
      app.post('/login', c => c.json({ success: true }))

      const res = await app.request('/login', { method: 'POST' })

      expect(res.status).toBe(200)
      expect(res.headers.get('RateLimit-Limit')).toBe('1000')

      const skipped = await app.request('/login', {
        method: 'POST',
        headers: { 'X-Skip-Rate-Limit': 'true' }
      })

      expect(skipped.status).toBe(200)
    })
  })

  describe('generalRateLimiter', () => {
    it('should apply env-appropriate limit and support skip header', async () => {
      app.use(generalRateLimiter)
      app.get('/data', c => c.json({ data: 'test' }))

      const res = await app.request('/data', { method: 'GET' })

      expect(res.status).toBe(200)
      expect(res.headers.get('RateLimit-Limit')).toBe('1000')

      const skipped = await app.request('/data', {
        method: 'GET',
        headers: { 'X-Skip-Rate-Limit': 'true' }
      })

      expect(skipped.status).toBe(200)
    })
  })
})
