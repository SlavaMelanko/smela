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

import { acceptInviteRoute } from '../index'

describe('auth /accept-invite', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const ACCEPT_INVITE_URL = '/api/v1/auth/accept-invite'

  let app: Hono
  let mockAcceptInvite: any

  beforeEach(async () => {
    mockAcceptInvite = mock(async () => ({
      data: {
        user: { id: testUuids.USER_1 },
        team: null,
        accessToken: 'test-token'
      },
      refreshToken: 'refresh-token'
    }))

    await moduleMocker.mock('@/use-cases/auth/accept-invite', () => ({
      acceptInvite: mockAcceptInvite
    }))

    app = createTestApp('/api/v1/auth', acceptInviteRoute)
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  const validPayload = {
    token: '1'.repeat(TOKEN_LENGTH),
    password: 'NewSecure@123'
  }

  describe('POST /accept-invite', () => {
    it('accepts invite and return user with tokens', async () => {
      const res = await post(app, ACCEPT_INVITE_URL, validPayload)

      expect(res.status).toBe(HttpStatus.OK)

      const data = await res.json()
      expect(data).toEqual({
        user: { id: testUuids.USER_1 },
        team: null,
        accessToken: 'test-token'
      })

      expect(mockAcceptInvite).toHaveBeenCalledWith(
        { token: validPayload.token, password: validPayload.password },
        { ipAddress: null, userAgent: null }
      )
      expect(mockAcceptInvite).toHaveBeenCalledTimes(1)

      // Verify refresh token cookie is set
      const cookies = res.headers.get('set-cookie')
      expect(cookies).toContain('refresh-token')
    })

    it('returns error status when use case throws', async () => {
      mockAcceptInvite.mockImplementationOnce(() => {
        throw new Error('Accept invite failed')
      })

      const res = await post(app, ACCEPT_INVITE_URL, validPayload)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(mockAcceptInvite).toHaveBeenCalledTimes(1)
    })

    it('rejects invalid tokens', async () => {
      const invalidPayloads = [
        { ...validPayload, token: 'short-token' },
        { ...validPayload, token: 'a'.repeat(100) },
        { password: validPayload.password }
      ]

      for (const payload of invalidPayloads) {
        const res = await post(app, ACCEPT_INVITE_URL, payload)

        expect(res.status).toBe(HttpStatus.BAD_REQUEST)
        expect(mockAcceptInvite).not.toHaveBeenCalled()
      }
    })

    it('rejects invalid passwords', async () => {
      const invalidPayloads = [
        ...WEAK_PASSWORDS.map(password => ({ ...validPayload, password })),
        { token: validPayload.token }
      ]

      for (const payload of invalidPayloads) {
        const res = await post(app, ACCEPT_INVITE_URL, payload)

        expect(res.status).toBe(HttpStatus.BAD_REQUEST)
        expect(mockAcceptInvite).not.toHaveBeenCalled()
      }
    })

    it('rejects malformed requests', async () => {
      for (const { headers, body } of buildMalformedRequests(validPayload)) {
        const res = await post(app, ACCEPT_INVITE_URL, body, headers)

        expect(res.status).toBe(HttpStatus.BAD_REQUEST)
        expect(mockAcceptInvite).not.toHaveBeenCalled()
      }
    })
  })
})
