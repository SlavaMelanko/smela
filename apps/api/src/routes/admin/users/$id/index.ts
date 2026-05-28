import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody, validateParams } from '@/middleware'
import Permission from '@/types/permission'

import { getUserHandler, updateUserHandler } from './handler'
import { updateUserBodySchema, userIdParamsSchema } from './schema'

export const adminUserByIdRoute = new Hono<AppContext>()

adminUserByIdRoute.get(
  '/',
  validateParams(userIdParamsSchema),
  requirePermission(Permission.ViewUsers),
  getUserHandler
)

adminUserByIdRoute.patch(
  '/',
  validateParams(userIdParamsSchema),
  validateBody(updateUserBodySchema),
  requirePermission(Permission.ManageUsers),
  updateUserHandler
)
