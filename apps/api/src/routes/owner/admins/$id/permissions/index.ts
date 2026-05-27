import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requestValidator, requirePermission } from '@/middleware'
import Permission from '@/types/permission'

import {
  getAdminPermissionsHandler,
  updateAdminPermissionsHandler
} from './handler'
import { adminIdParamsSchema, updateAdminPermissionsBodySchema } from './schema'

export const ownerAdminPermissionsRoute = new Hono<AppContext>()

ownerAdminPermissionsRoute.get(
  '/',
  requestValidator('param', adminIdParamsSchema),
  requirePermission(Permission.ViewAdmins),
  getAdminPermissionsHandler
)

ownerAdminPermissionsRoute.patch(
  '/',
  requestValidator('param', adminIdParamsSchema),
  requestValidator('json', updateAdminPermissionsBodySchema),
  requirePermission(Permission.ManageAdmins),
  updateAdminPermissionsHandler
)
