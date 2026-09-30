import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import {
  buildMalformedRequests,
  createTestApp,
  ModuleMocker,
  post,
  testUuids,
  WEAK_PASSWORDS
} from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { TOKEN_LENGTH } from '@/security/token'

import { resetPasswordRoute } from '../index'

describe('auth /reset-password', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const RESET_PASSWORD_URL = '/api/v1/auth/reset-password'

  let app: Hono
  let mockResetPassword: any

  beforeEach(async () => {
    mockResetPassword = mock(async () => ({
      data: { user: { id: testUuids.USER_1 }, accessToken: 'test-token' },
      refreshToken: 'refresh-token'
    }))

    await moduleMocker.mock('@/use-cases/auth/reset-password', () => ({
      resetPassword: mockResetPassword
    }))

    app = createTestApp('/api/v1/auth', resetPasswordRoute)
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  const validPayload = {
    token: '1'.repeat(TOKEN_LENGTH),
    password: 'NewSecure@123'
  }

  describe('POST /reset-password', () => {
    it('should reset password and return user with tokens', async () => {
      const res = await post(app, RESET_PASSWORD_URL, validPayload)

      expect(res.status).toBe(HttpStatus.OK)

      const data = await res.json()
      expect(data).toEqual({
        user: { id: testUuids.USER_1 },
        accessToken: 'test-token'
      })

      expect(mockResetPassword).toHaveBeenCalledWith(
        { token: validPayload.token, password: validPayload.password },
        { ipAddress: null, userAgent: null }
      )
      expect(mockResetPassword).toHaveBeenCalledTimes(1)

      // Verify refresh token cookie is set
      const cookies = res.headers.get('set-cookie')
      expect(cookies).toContain('refresh-token')
    })

    it('should handle reset password errors', async () => {
      mockResetPassword.mockImplementationOnce(() => {
        throw new Error('Password reset failed')
      })

      const res = await post(app, RESET_PASSWORD_URL, validPayload)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(mockResetPassword).toHaveBeenCalledTimes(1)
    })

    it('should validate token requirements', async () => {
      const invalidPayloads = [
        { ...validPayload, token: 'short-token' },
        { ...validPayload, token: 'a'.repeat(100) },
        { password: validPayload.password }
      ]

      for (const payload of invalidPayloads) {
        const res = await post(app, RESET_PASSWORD_URL, payload)

        expect(res.status).toBe(HttpStatus.BAD_REQUEST)
        expect(mockResetPassword).not.toHaveBeenCalled()
      }
    })

    it('should validate password requirements', async () => {
      const invalidPayloads = [
        ...WEAK_PASSWORDS.map(password => ({ ...validPayload, password })),
        { token: validPayload.token }
      ]

      for (const payload of invalidPayloads) {
        const res = await post(app, RESET_PASSWORD_URL, payload)

        expect(res.status).toBe(HttpStatus.BAD_REQUEST)
        expect(mockResetPassword).not.toHaveBeenCalled()
      }
    })

    it('should handle malformed requests', async () => {
      for (const { headers, body } of buildMalformedRequests(validPayload)) {
        const res = await post(app, RESET_PASSWORD_URL, body, headers)

        expect(res.status).toBe(HttpStatus.BAD_REQUEST)
        expect(mockResetPassword).not.toHaveBeenCalled()
      }
    })
  })
})
