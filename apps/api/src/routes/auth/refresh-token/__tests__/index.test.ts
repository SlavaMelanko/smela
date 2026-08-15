import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import { createTestApp, ModuleMocker, post, testUuids } from '@/__tests__'
import env from '@/env'
import { HttpStatus } from '@/net/http'
import { Role, UserStatus } from '@/types'

import { refreshTokenRoute } from '../index'

describe('auth /refresh-token', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const REFRESH_TOKEN_URL = '/api/v1/auth/refresh-token'
  const REFRESH_TOKEN = 'refresh_token_123'
  const NEW_REFRESH_TOKEN = 'new_refresh_token_456'

  const cookieHeader = {
    Cookie: `${env.COOKIE_REFRESH_TOKEN_NAME}=${REFRESH_TOKEN}`
  }

  let app: Hono
  let mockRefreshAuthTokens: any

  beforeEach(async () => {
    mockRefreshAuthTokens = mock(async () => ({
      data: {
        user: {
          id: testUuids.USER_1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          role: Role.User,
          status: UserStatus.Verified,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        accessToken: 'new_access_token_123'
      },
      refreshToken: NEW_REFRESH_TOKEN
    }))

    await moduleMocker.mock('@/use-cases/auth', () => ({
      refreshAuthTokens: mockRefreshAuthTokens
    }))

    app = createTestApp('/api/v1/auth', refreshTokenRoute)
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('POST /refresh-token', () => {
    it('should refresh tokens and return user data with new access token', async () => {
      const res = await post(app, REFRESH_TOKEN_URL, undefined, cookieHeader)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockRefreshAuthTokens).toHaveBeenCalledWith(
        { refreshToken: REFRESH_TOKEN },
        { ipAddress: null, userAgent: null }
      )

      const data = await res.json()
      expect(data).toMatchObject({
        user: { id: testUuids.USER_1, email: 'test@example.com' },
        accessToken: 'new_access_token_123'
      })
    })

    it('should set new refresh token cookie', async () => {
      const res = await post(app, REFRESH_TOKEN_URL, undefined, cookieHeader)

      expect(res.status).toBe(HttpStatus.OK)

      const setCookie = res.headers.get('set-cookie')
      expect(setCookie).toContain(
        `${env.COOKIE_REFRESH_TOKEN_NAME}=${NEW_REFRESH_TOKEN}`
      )
    })

    it('should pass device info from request headers to use case', async () => {
      const res = await post(app, REFRESH_TOKEN_URL, undefined, {
        ...cookieHeader,
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Mozilla/5.0 (Test)'
      })

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockRefreshAuthTokens).toHaveBeenCalledWith(
        { refreshToken: REFRESH_TOKEN },
        { ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0 (Test)' }
      )
    })

    it('should pass undefined token when refresh cookie is missing', async () => {
      const res = await post(app, REFRESH_TOKEN_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockRefreshAuthTokens).toHaveBeenCalledWith(
        { refreshToken: undefined },
        { ipAddress: null, userAgent: null }
      )
    })

    it('should return error status without setting cookie when use case throws', async () => {
      mockRefreshAuthTokens.mockImplementation(async () => {
        throw new Error('Invalid refresh token')
      })

      const res = await post(app, REFRESH_TOKEN_URL, undefined, cookieHeader)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(res.headers.get('set-cookie')).toBeNull()
    })
  })
})
