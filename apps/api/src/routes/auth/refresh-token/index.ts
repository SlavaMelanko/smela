import { Hono } from 'hono'

import type { AppContext } from '@/context'

import {
  getDeviceInfo,
  getRefreshCookie,
  HttpStatus,
  setRefreshCookie
} from '@/net/http'
import { refreshAuthTokens } from '@/use-cases/auth'

export const refreshTokenRoute = new Hono<AppContext>()

refreshTokenRoute.post('/refresh-token', async c => {
  const refreshToken = getRefreshCookie(c)
  const deviceInfo = getDeviceInfo(c)

  const result = await refreshAuthTokens({ refreshToken }, deviceInfo)

  setRefreshCookie(c, result.refreshToken)

  return c.json(result.data, HttpStatus.OK)
})
