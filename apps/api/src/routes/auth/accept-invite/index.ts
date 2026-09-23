import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody } from '@/middleware'
import { getDeviceInfo, HttpStatus, setRefreshCookie } from '@/net/http'
import { acceptInvite } from '@/use-cases/auth/accept-invite'

import { acceptInviteBodySchema } from './schema'

export const acceptInviteRoute = new Hono<AppContext>()

acceptInviteRoute.post(
  '/accept-invite',
  validateBody(acceptInviteBodySchema),
  async c => {
    const { token, password } = c.req.valid('json')
    const deviceInfo = getDeviceInfo(c)

    const result = await acceptInvite({ token, password }, deviceInfo)

    setRefreshCookie(c, result.refreshToken)

    return c.json(result.data, HttpStatus.OK)
  }
)
