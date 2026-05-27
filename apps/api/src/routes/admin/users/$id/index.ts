import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody, validateParams } from '@/middleware'

import { getUserHandler, updateUserHandler } from './handler'
import { updateUserBodySchema, userIdParamsSchema } from './schema'

export const adminUserByIdRoute = new Hono<AppContext>()

adminUserByIdRoute.get('/', validateParams(userIdParamsSchema), getUserHandler)

adminUserByIdRoute.patch(
  '/',
  validateParams(userIdParamsSchema),
  validateBody(updateUserBodySchema),
  updateUserHandler
)
