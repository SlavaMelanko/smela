import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody } from '@/middleware'
import { getDeviceInfo, HttpStatus, setRefreshCookie } from '@/net/http'
import { verifyEmail } from '@/use-cases/auth/verify-email'

import { verifyEmailBodySchema } from './schema'

export const verifyEmailRoute = new Hono<AppContext>()

verifyEmailRoute.post(
  '/verify-email',
  validateBody(verifyEmailBodySchema),
  async c => {
    const { token } = c.req.valid('json')
    const deviceInfo = getDeviceInfo(c)

    const result = await verifyEmail({ token }, deviceInfo)

    setRefreshCookie(c, result.refreshToken)

    return c.json(result.data, HttpStatus.OK)
  }
)
