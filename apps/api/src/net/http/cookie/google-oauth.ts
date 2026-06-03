import type { Context } from 'hono'

import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

import { isDevOrTestEnv } from '@/env'

const STATE_COOKIE = 'google_oauth_state'
const STATE_COOKIE_MAX_AGE = 600 // 10 minutes

export const setGoogleStateCookie = (c: Context, state: string): void => {
  setCookie(c, STATE_COOKIE, state, {
    httpOnly: true,
    secure: !isDevOrTestEnv(),
    sameSite: 'lax',
    maxAge: STATE_COOKIE_MAX_AGE,
    path: '/'
  })
}

export const getGoogleStateCookie = (c: Context): string | undefined =>
  getCookie(c, STATE_COOKIE)

export const deleteGoogleStateCookie = (c: Context): void => {
  deleteCookie(c, STATE_COOKIE, { path: '/' })
}
