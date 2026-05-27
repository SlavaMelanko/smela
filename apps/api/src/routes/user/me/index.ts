import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody } from '@/middleware'

import { changePasswordHandler, getMeHandler, updateMeHandler } from './handler'
import { changePasswordSchema, updateProfileSchema } from './schema'

export const meRoute = new Hono<AppContext>()

meRoute.get('/me', getMeHandler)

meRoute.patch('/me', validateBody(updateProfileSchema), updateMeHandler)

meRoute.patch(
  '/me/password',
  validateBody(changePasswordSchema),
  changePasswordHandler
)
