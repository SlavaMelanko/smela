import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody, validateQuery } from '@/middleware'
import Permission from '@/types/permission'

import { ownerAdminByIdRoute } from './$id'
import {
  createAdminHandler,
  getAdminDefaultPermissionsHandler,
  getAdminsHandler
} from './handler'
import { createAdminBodySchema, getAdminsQuerySchema } from './schema'

export const ownerAdminsRoute = new Hono<AppContext>()

ownerAdminsRoute.get(
  '/admins',
  validateQuery(getAdminsQuerySchema),
  requirePermission(Permission.ViewAdmins),
  getAdminsHandler
)

ownerAdminsRoute.post(
  '/admins',
  validateBody(createAdminBodySchema),
  requirePermission(Permission.ManageAdmins),
  createAdminHandler
)

ownerAdminsRoute.get(
  '/admins/default-permissions',
  requirePermission(Permission.ViewAdmins),
  getAdminDefaultPermissionsHandler
)

ownerAdminsRoute.route('/admins/:adminId', ownerAdminByIdRoute)
