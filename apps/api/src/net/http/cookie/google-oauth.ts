import type { Context } from 'hono'

import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

import env, { isDevOrTestEnv } from '@/env'

export const setGoogleStateCookie = (c: Context, state: string): void => {
  setCookie(c, env.GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: !isDevOrTestEnv(),
    sameSite: 'lax',
    maxAge: env.GOOGLE_OAUTH_STATE_COOKIE_MAX_AGE,
    path: '/'
  })
}

export const getGoogleStateCookie = (c: Context): string | undefined =>
  getCookie(c, env.GOOGLE_OAUTH_STATE_COOKIE)

export const deleteGoogleStateCookie = (c: Context): void => {
  deleteCookie(c, env.GOOGLE_OAUTH_STATE_COOKIE, { path: '/' })
}
