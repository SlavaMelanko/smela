import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateQuery } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { checkInvite } from '@/use-cases/auth/check-invite'

import { checkInviteQuerySchema } from './schema'

export const checkInviteRoute = new Hono<AppContext>()

checkInviteRoute.get(
  '/check-invite',
  validateQuery(checkInviteQuerySchema),
  async c => {
    const { token } = c.req.valid('query')

    const result = await checkInvite(token)

    return c.json({ data: result }, HttpStatus.OK)
  }
)
