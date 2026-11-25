import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { checkInvite } from '@/use-cases/auth/check-invite'

import { checkInviteBodySchema } from './schema'

export const checkInviteRoute = new Hono<AppContext>()

checkInviteRoute.post(
  '/check-invite',
  validateBody(checkInviteBodySchema),
  async c => {
    const { token } = c.req.valid('json')

    const result = await checkInvite(token)

    return c.json(result, HttpStatus.OK)
  }
)
