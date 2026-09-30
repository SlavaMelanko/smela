import { beforeEach, describe, expect, it } from 'bun:test'
import { Hono } from 'hono'

import { getClientIp } from '..'

describe('Rate Limiter Utils', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    app.get('/test', c => c.json({ ip: getClientIp(c) }))
  })

  describe('getClientIp', () => {
    it('should extract IP from X-Forwarded-For header', async () => {
      const res = await app.request('/test', {
        method: 'GET',
        headers: { 'X-Forwarded-For': '192.168.1.1, 10.0.0.1' }
      })

      const { ip } = await res.json()
      expect(ip).toBe('192.168.1.1') // Should take the first IP
    })

    it('should extract IP from X-Real-IP header when X-Forwarded-For is not present', async () => {
      const res = await app.request('/test', {
        method: 'GET',
        headers: { 'X-Real-IP': '203.0.113.1' }
      })

      const { ip } = await res.json()
      expect(ip).toBe('203.0.113.1')
    })

    it('should extract IP from CF-Connecting-IP header when others are not present', async () => {
      const res = await app.request('/test', {
        method: 'GET',
        headers: { 'CF-Connecting-IP': '198.51.100.1' }
      })

      const { ip } = await res.json()
      expect(ip).toBe('198.51.100.1')
    })

    it('should return "unknown-ip" when no IP headers are present', async () => {
      const res = await app.request('/test', { method: 'GET' })

      const { ip } = await res.json()
      expect(ip).toBe('unknown-ip')
    })

    it('should prioritize X-Forwarded-For over other headers', async () => {
      const res = await app.request('/test', {
        method: 'GET',
        headers: {
          'X-Forwarded-For': '192.168.1.1',
          'X-Real-IP': '203.0.113.1',
          'CF-Connecting-IP': '198.51.100.1'
        }
      })

      const { ip } = await res.json()
      expect(ip).toBe('192.168.1.1')
    })

    it('should trim whitespace from X-Forwarded-For IP', async () => {
      const res = await app.request('/test', {
        method: 'GET',
        headers: { 'X-Forwarded-For': ' 192.168.1.1 , 10.0.0.1' }
      })

      const { ip } = await res.json()
      expect(ip).toBe('192.168.1.1')
    })
  })
})
