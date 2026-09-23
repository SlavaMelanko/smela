import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { deleteRefreshCookie, getRefreshCookie, HttpStatus } from '@/net/http'
import { logout } from '@/use-cases/auth/logout'

export const logoutRoute = new Hono<AppContext>()

logoutRoute.post('/logout', async c => {
  const refreshToken = getRefreshCookie(c)

  await logout(refreshToken)

  deleteRefreshCookie(c)

  return c.body(null, HttpStatus.NO_CONTENT)
})
