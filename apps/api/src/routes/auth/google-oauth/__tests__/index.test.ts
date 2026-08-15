import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import { createTestApp, get, ModuleMocker } from '@/__tests__'
import env from '@/env'
import { AppError, ErrorCode } from '@/errors'
import { HttpStatus } from '@/net/http'

import { googleOAuthRoute } from '..'

describe('auth /google', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const CALLBACK_URL = '/api/v1/auth/google/callback'

  let app: Hono
  let mockCompleteGoogleOAuth: any

  const buildErrorRedirect = (code: string) =>
    `${env.FE_USER_URL}/login?error=${encodeURIComponent(code)}`

  beforeEach(async () => {
    mockCompleteGoogleOAuth = mock(async () => ({
      isNew: false,
      refreshToken: 'refresh_token_123'
    }))

    await moduleMocker.mock('@/use-cases/auth/google-oauth', () => ({
      completeGoogleOAuth: mockCompleteGoogleOAuth
    }))

    app = createTestApp('/api/v1/auth', googleOAuthRoute)
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /google', () => {
    it('should redirect to Google and set state cookie', async () => {
      const res = await get(app, '/api/v1/auth/google')

      expect(res.status).toBe(HttpStatus.MOVED_TEMPORARILY)

      const location = new URL(res.headers.get('location')!)
      expect(location.origin + location.pathname).toBe(
        'https://accounts.google.com/o/oauth2/v2/auth'
      )

      const state = location.searchParams.get('state')
      expect(state).toBeTruthy()
      expect(res.headers.get('set-cookie')).toContain(
        `${env.GOOGLE_OAUTH_STATE_COOKIE}=${state}`
      )
    })
  })

  describe('GET /google/callback', () => {
    const withStateCookie = {
      Cookie: `${env.GOOGLE_OAUTH_STATE_COOKIE}=state-123`
    }

    it('should redirect with cancelled code when params are missing', async () => {
      const res = await get(app, CALLBACK_URL)

      expect(res.status).toBe(HttpStatus.MOVED_TEMPORARILY)
      expect(res.headers.get('location')).toBe(
        buildErrorRedirect(ErrorCode.GoogleOAuthCancelled)
      )
      expect(mockCompleteGoogleOAuth).not.toHaveBeenCalled()
    })

    it('should redirect with invalid state code when state does not match cookie', async () => {
      const res = await get(
        app,
        `${CALLBACK_URL}?code=auth-code&state=other`,
        withStateCookie
      )

      expect(res.status).toBe(HttpStatus.MOVED_TEMPORARILY)
      expect(res.headers.get('location')).toBe(
        buildErrorRedirect(ErrorCode.GoogleOAuthInvalidState)
      )
      expect(mockCompleteGoogleOAuth).not.toHaveBeenCalled()
    })

    it('should set refresh cookie and redirect to frontend callback', async () => {
      const res = await get(
        app,
        `${CALLBACK_URL}?code=auth-code&state=state-123`,
        withStateCookie
      )

      expect(res.status).toBe(HttpStatus.MOVED_TEMPORARILY)
      expect(mockCompleteGoogleOAuth).toHaveBeenCalledWith(
        'auth-code',
        expect.anything()
      )
      expect(res.headers.get('location')).toBe(
        `${env.FE_USER_URL}/auth/google/callback`
      )
      expect(res.headers.get('set-cookie')).toContain(
        `${env.COOKIE_REFRESH_TOKEN_NAME}=refresh_token_123`
      )
    })

    it('should append new flag for first-time users', async () => {
      mockCompleteGoogleOAuth.mockImplementation(async () => ({
        isNew: true,
        refreshToken: 'refresh_token_123'
      }))

      const res = await get(
        app,
        `${CALLBACK_URL}?code=auth-code&state=state-123`,
        withStateCookie
      )

      expect(res.headers.get('location')).toBe(
        `${env.FE_USER_URL}/auth/google/callback?new=1`
      )
    })

    it('should redirect with error code when use case throws AppError', async () => {
      mockCompleteGoogleOAuth.mockImplementation(async () => {
        throw new AppError(
          ErrorCode.GoogleEmailNotVerified,
          'Google email not verified'
        )
      })

      const res = await get(
        app,
        `${CALLBACK_URL}?code=auth-code&state=state-123`,
        withStateCookie
      )

      expect(res.status).toBe(HttpStatus.MOVED_TEMPORARILY)
      expect(res.headers.get('location')).toBe(
        buildErrorRedirect(ErrorCode.GoogleEmailNotVerified)
      )
    })
  })
})
