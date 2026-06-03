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
import { buildAuthUrl, exchangeCodeForProfile } from '@/services/google'
import { loginOrSignupWithGoogle } from '@/use-cases/auth/google-oauth'

const buildErrorRedirect = (reason: string) =>
  `${env.FE_USER_URL}/login?reason=${encodeURIComponent(reason)}`

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
      buildErrorRedirect('auth/google-oauth-cancelled'),
      HttpStatus.MOVED_TEMPORARILY
    )
  }

  if (!isValidGoogleState(c, state)) {
    return c.redirect(
      buildErrorRedirect('auth/google-oauth-invalid-state'),
      HttpStatus.MOVED_TEMPORARILY
    )
  }

  try {
    const profile = await exchangeCodeForProfile(code)
    const deviceInfo = getDeviceInfo(c)

    const result = await loginOrSignupWithGoogle(
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
      `${env.FE_USER_URL}/auth/google/callback`,
      HttpStatus.MOVED_TEMPORARILY
    )
  } catch (err) {
    const reason = err instanceof AppError ? err.code : ErrorCode.InternalError

    return c.redirect(buildErrorRedirect(reason), HttpStatus.MOVED_TEMPORARILY)
  }
}
