import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody } from '@/middleware'

import { resetPasswordHandler } from './handler'
import { resetPasswordBodySchema } from './schema'

export const resetPasswordRoute = new Hono<AppContext>()

resetPasswordRoute.post(
  '/reset-password',
  validateBody(resetPasswordBodySchema),
  resetPasswordHandler
)
