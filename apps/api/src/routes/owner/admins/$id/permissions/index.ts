import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody, validateParams } from '@/middleware'
import Permission from '@/types/permission'

import {
  getAdminPermissionsHandler,
  updateAdminPermissionsHandler
} from './handler'
import { adminIdParamsSchema, updateAdminPermissionsBodySchema } from './schema'

export const ownerAdminPermissionsRoute = new Hono<AppContext>()

ownerAdminPermissionsRoute.get(
  '/',
  validateParams(adminIdParamsSchema),
  requirePermission(Permission.ViewAdmins),
  getAdminPermissionsHandler
)

ownerAdminPermissionsRoute.patch(
  '/',
  validateParams(adminIdParamsSchema),
  validateBody(updateAdminPermissionsBodySchema),
  requirePermission(Permission.ManageAdmins),
  updateAdminPermissionsHandler
)
