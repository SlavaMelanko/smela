import type { Context } from 'hono'

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
import { buildAuthUrl, exchangeCodeForProfile } from '@/services/google'
import { logInOrSignUpWithGoogle } from '@/use-cases/auth/google-oauth'

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

export const googleRedirectHandler = (c: Context<AppContext>) => {
  const state = crypto.randomUUID()

  setGoogleStateCookie(c, state)

  return c.redirect(buildAuthUrl(state), HttpStatus.MOVED_TEMPORARILY)
}

export const googleCallbackHandler = async (c: Context<AppContext>) => {
  const { code, state, error } = c.req.query()

  if (error || !code || !state) {
    logger.warn(
      { error, hasCode: Boolean(code), hasState: Boolean(state) },
      'Google OAuth callback cancelled or missing parameters'
    )

    return c.redirect(
      buildErrorRedirect(ErrorCode.GoogleOAuthCancelled),
      HttpStatus.MOVED_TEMPORARILY
    )
  }

  if (!isValidGoogleState(c, state)) {
    return c.redirect(
      buildErrorRedirect(ErrorCode.GoogleOAuthInvalidState),
      HttpStatus.MOVED_TEMPORARILY
    )
  }

  try {
    const profile = await exchangeCodeForProfile(code)
    const deviceInfo = getDeviceInfo(c)

    const result = await logInOrSignUpWithGoogle(
      {
        googleId: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName
      },
      deviceInfo
    )

    setRefreshCookie(c, result.refreshToken)

    // Redirect to frontend callback page — frontend will call /refresh-token
    // to exchange the httpOnly cookie for an access token (no token in URL)
    return c.redirect(
      buildCallbackRedirect(result.isNew),
      HttpStatus.MOVED_TEMPORARILY
    )
  } catch (err) {
    // Past this redirect the failure is silent to us — always capture
    getErrorTracker().captureError(
      err instanceof Error ? err : new Error(String(err))
    )

    const code = err instanceof AppError ? err.code : ErrorCode.InternalError

    return c.redirect(buildErrorRedirect(code), HttpStatus.MOVED_TEMPORARILY)
  }
}
