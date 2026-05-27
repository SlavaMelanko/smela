import { describe, expect, it } from 'bun:test'
import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { secureHeaders } from '../index'

const makeApp = () => {
  const app = new Hono<AppContext>()
  app.use('*', secureHeaders)
  app.get('/test', c => c.json({ success: true }))

  return app
}

describe('Secure Headers Middleware', () => {
  describe('Basic Secure Headers', () => {
    it('should set all basic secure headers', async () => {
      const res = await makeApp().request('/test')

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(res.headers.get('X-Frame-Options')).toBe('DENY')
      expect(res.headers.get('Referrer-Policy')).toBe(
        'strict-origin-when-cross-origin'
      )

      const xssProtection = res.headers.get('X-XSS-Protection')
      expect(xssProtection === null || xssProtection === '0').toBe(true)
    })
  })

  describe('Environment-Specific Headers', () => {
    it('should not set Strict-Transport-Security in test environment', async () => {
      const res = await makeApp().request('/test')

      expect(res.headers.get('Strict-Transport-Security')).toBeNull()
    })
  })

  describe('Content Security Policy', () => {
    it('should set all required CSP directives including env-specific ones', async () => {
      const res = await makeApp().request('/test')
      const csp = res.headers.get('Content-Security-Policy')

      expect(csp).toBeTruthy()
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("style-src 'self' 'unsafe-inline'")
      expect(csp).toContain("font-src 'self'")
      expect(csp).toContain("connect-src 'self'")
      expect(csp).toContain("frame-ancestors 'none'")
      expect(csp).toContain("base-uri 'self'")
      expect(csp).toContain("form-action 'self'")
      expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'")
      expect(csp).toContain("img-src 'self' data: https: http:")
    })
  })

  describe('Permissions Policy', () => {
    it('should disable all sensitive features', async () => {
      const res = await makeApp().request('/test')
      const permissionsPolicy = res.headers.get('Permissions-Policy')

      expect(permissionsPolicy).toBeTruthy()
      expect(permissionsPolicy).toContain('geolocation=()')
      expect(permissionsPolicy).toContain('camera=()')
      expect(permissionsPolicy).toContain('microphone=()')
      expect(permissionsPolicy).toContain('payment=()')
      expect(permissionsPolicy).toContain('usb=()')
      expect(permissionsPolicy).toContain('magnetometer=()')
      expect(permissionsPolicy).toContain('gyroscope=()')
      expect(permissionsPolicy).toContain('accelerometer=()')
    })
  })

  describe('Response Handling', () => {
    it('should preserve original response status', async () => {
      const app = makeApp()
      app.get('/error', c => c.text('Error', 500))
      app.get('/created', c => c.json({ id: 1 }, 201))

      const errorRes = await app.request('/error')
      expect(errorRes.status).toBe(500)
      expect(errorRes.headers.get('X-Frame-Options')).toBe('DENY')

      const createdRes = await app.request('/created')
      expect(createdRes.status).toBe(201)
      expect(createdRes.headers.get('X-Content-Type-Options')).toBe('nosniff')
    })

    it('should preserve custom headers alongside secure headers', async () => {
      const app = makeApp()
      app.get('/custom', c => {
        c.header('X-Custom-Header', 'custom-value')

        return c.json({ success: true })
      })

      const res = await app.request('/custom')

      expect(res.headers.get('X-Custom-Header')).toBe('custom-value')
      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(res.headers.get('X-Frame-Options')).toBe('DENY')
    })
  })

  describe('Edge Cases', () => {
    it('should apply headers to HEAD and OPTIONS requests', async () => {
      const app = makeApp()

      for (const method of ['HEAD', 'OPTIONS']) {
        const res = await app.request('/test', { method })

        expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
        expect(res.headers.get('X-Frame-Options')).toBe('DENY')
      }
    })
  })
})
