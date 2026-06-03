import type { Context } from 'hono'

import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

import type { AppContext } from '@/context'

import env, { isDevOrTestEnv } from '@/env'
import { AppError, ErrorCode } from '@/errors'
import { getDeviceInfo, setRefreshCookie } from '@/net/http'
import { buildAuthUrl, exchangeCodeForProfile } from '@/services/google'
import { loginOrSignupWithGoogle } from '@/use-cases/auth/google-oauth'

const STATE_COOKIE = 'google_oauth_state'
const STATE_COOKIE_MAX_AGE = 600 // 10 minutes

const setStateCookie = (c: Context, state: string) => {
  setCookie(c, STATE_COOKIE, state, {
    httpOnly: true,
    secure: !isDevOrTestEnv(),
    sameSite: 'lax',
    maxAge: STATE_COOKIE_MAX_AGE,
    path: '/'
  })
}

const buildErrorRedirect = (reason: string) =>
  `${env.FE_USER_URL}/login?reason=${encodeURIComponent(reason)}`

export const googleRedirectHandler = (c: Context<AppContext>) => {
  const state = crypto.randomUUID()

  setStateCookie(c, state)

  return c.redirect(buildAuthUrl(state), 302)
}

export const googleCallbackHandler = async (c: Context<AppContext>) => {
  const { code, state, error } = c.req.query()

  if (error || !code || !state) {
    return c.redirect(buildErrorRedirect('google-oauth-cancelled'), 302)
  }

  const storedState = getCookie(c, STATE_COOKIE)
  deleteCookie(c, STATE_COOKIE, { path: '/' })

  if (!storedState || storedState !== state) {
    return c.redirect(buildErrorRedirect('google-oauth-invalid-state'), 302)
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
    return c.redirect(`${env.FE_USER_URL}/auth/google/callback`, 302)
  } catch (err) {
    const reason = err instanceof AppError ? err.code : ErrorCode.InternalError

    return c.redirect(buildErrorRedirect(reason), 302)
  }
}
