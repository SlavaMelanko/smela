import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateQuery } from '@/middleware'

import { checkInviteHandler } from './handler'
import { checkInviteQuerySchema } from './schema'

export const checkInviteRoute = new Hono<AppContext>()

checkInviteRoute.get(
  '/check-invite',
  validateQuery(checkInviteQuerySchema),
  checkInviteHandler
)
