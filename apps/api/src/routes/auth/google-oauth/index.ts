import type { Context } from 'hono'

import { Hono } from 'hono'

import type { AppContext } from '@/context'

import env from '@/env'
import { AppError, ErrorCode } from '@/errors'
import { logger } from '@/logging'
import {
  deleteGoogleStateCookie,
  getDeviceInfo,
  getGoogleStateCookie,
  HttpStatus,
  setGoogleStateCookie,
  setRefreshCookie
} from '@/net/http'
import { getErrorTracker } from '@/services'
import { buildAuthUrl } from '@/services/google'
import { completeGoogleOAuth } from '@/use-cases/auth/google-oauth'

const redirect = (c: Context<AppContext>, url: string) =>
  c.redirect(url, HttpStatus.MOVED_TEMPORARILY)

const buildErrorRedirect = (code: string) =>
  `${env.FE_USER_URL}/login?error=${encodeURIComponent(code)}`

const buildCallbackRedirect = (isNew: boolean) => {
  const url = new URL(`${env.FE_USER_URL}/auth/google/callback`)

  if (isNew) {
    url.searchParams.set('new', '1')
  }

  return url.toString()
}

const isValidGoogleState = (c: Context<AppContext>, state: string) => {
  const storedState = getGoogleStateCookie(c)
  deleteGoogleStateCookie(c)

  return !!storedState && storedState === state
}

export const googleOAuthRoute = new Hono<AppContext>()

googleOAuthRoute.get('/google', c => {
  const state = crypto.randomUUID()

  setGoogleStateCookie(c, state)

  return redirect(c, buildAuthUrl(state))
})

googleOAuthRoute.get('/google/callback', async c => {
  const { code, state, error } = c.req.query()

  if (error || !code || !state) {
    logger.warn(
      { error, hasCode: Boolean(code), hasState: Boolean(state) },
      'Google OAuth callback cancelled or missing parameters'
    )

    return redirect(c, buildErrorRedirect(ErrorCode.GoogleOAuthCancelled))
  }

  if (!isValidGoogleState(c, state)) {
    return redirect(c, buildErrorRedirect(ErrorCode.GoogleOAuthInvalidState))
  }

  try {
    const { isNew, refreshToken } = await completeGoogleOAuth(
      code,
      getDeviceInfo(c)
    )

    setRefreshCookie(c, refreshToken)

    // Redirect to frontend callback page — frontend will call /refresh-token
    // to exchange the httpOnly cookie for an access token (no token in URL)
    return redirect(c, buildCallbackRedirect(isNew))
  } catch (err) {
    // Past this redirect the failure is silent to us — always capture
    getErrorTracker().captureError(
      err instanceof Error ? err : new Error(String(err))
    )

    const errorCode =
      err instanceof AppError ? err.code : ErrorCode.InternalError

    return redirect(c, buildErrorRedirect(errorCode))
  }
})
