import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import { createTestApp, ModuleMocker, post } from '@/__tests__'
import env from '@/env'
import { HttpStatus } from '@/net/http'

import { logoutRoute } from '../index'

describe('auth /logout', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const LOGOUT_URL = '/api/v1/auth/logout'
  const REFRESH_TOKEN = 'refresh_token_123'

  const cookieHeader = {
    Cookie: `${env.COOKIE_REFRESH_TOKEN_NAME}=${REFRESH_TOKEN}`
  }

  let app: Hono
  let mockLogout: any

  beforeEach(async () => {
    mockLogout = mock(async () => {})

    await moduleMocker.mock('@/use-cases/auth/logout', () => ({
      logout: mockLogout
    }))

    app = createTestApp('/api/v1/auth', logoutRoute)
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('POST /logout', () => {
    it('should revoke refresh token and return no content', async () => {
      const res = await post(app, LOGOUT_URL, undefined, cookieHeader)

      expect(res.status).toBe(HttpStatus.NO_CONTENT)
      expect(mockLogout).toHaveBeenCalledWith(REFRESH_TOKEN)
      expect(await res.text()).toBe('')
    })

    it('should delete refresh cookie in response', async () => {
      const res = await post(app, LOGOUT_URL, undefined, cookieHeader)

      expect(res.status).toBe(HttpStatus.NO_CONTENT)

      const setCookie = res.headers.get('set-cookie')
      expect(setCookie).toContain(`${env.COOKIE_REFRESH_TOKEN_NAME}=`)
      expect(setCookie).toContain('Max-Age=0')
    })

    it('should logout when no refresh token exists', async () => {
      const res = await post(app, LOGOUT_URL)

      expect(res.status).toBe(HttpStatus.NO_CONTENT)
      expect(mockLogout).toHaveBeenCalledWith(undefined)
    })

    it('should return error status when use case throws', async () => {
      mockLogout.mockImplementation(async () => {
        throw new Error('Token revocation failed')
      })

      const res = await post(app, LOGOUT_URL, undefined, cookieHeader)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
