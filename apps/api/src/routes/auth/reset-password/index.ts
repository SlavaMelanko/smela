import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody } from '@/middleware'
import { getDeviceInfo, HttpStatus, setRefreshCookie } from '@/net/http'
import { resetPassword } from '@/use-cases/auth/reset-password'

import { resetPasswordBodySchema } from './schema'

export const resetPasswordRoute = new Hono<AppContext>()

resetPasswordRoute.post(
  '/reset-password',
  validateBody(resetPasswordBodySchema),
  async c => {
    const { token, password } = c.req.valid('json')
    const deviceInfo = getDeviceInfo(c)

    const result = await resetPassword({ token, password }, deviceInfo)

    setRefreshCookie(c, result.refreshToken)

    return c.json(result.data, HttpStatus.OK)
  }
)
