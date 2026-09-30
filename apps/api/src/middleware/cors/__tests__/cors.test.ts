import { describe, expect, it } from 'bun:test'
import { Hono } from 'hono'

import { dev, test } from '../env'

describe('cors', () => {
  describe('dev', () => {
    const app = new Hono()
    app.use('*', dev())
    app.get('/test', c => c.json({ success: true }))

    it('allows localhost origins', async () => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'https://localhost:8080'
      ]

      for (const origin of allowedOrigins) {
        const response = await app.request('/test', {
          headers: { Origin: origin }
        })

        expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin)
        expect(response.headers.get('Access-Control-Allow-Credentials')).toBe(
          'true'
        )
      }
    })

    it('rejects non-localhost origins', async () => {
      const response = await app.request('/test', {
        headers: { Origin: 'https://example.com' }
      })

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
    })

    it('allows any origin when Origin header is missing', async () => {
      const response = await app.request('/test')

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('answers preflight requests', async () => {
      const response = await app.request('/test', {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      })

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'http://localhost:3000'
      )
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
        'POST'
      )
      expect(response.headers.get('Access-Control-Max-Age')).toBe('600')
    })
  })

  describe('test', () => {
    const app = new Hono()
    app.use('*', test())
    app.get('/test', c => c.json({ success: true }))

    it('allows all origins without credentials', async () => {
      const response = await app.request('/test', {
        headers: { Origin: 'https://any-domain.com' }
      })

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(
        response.headers.get('Access-Control-Allow-Credentials')
      ).toBeNull()
    })
  })
})
