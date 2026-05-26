import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requestValidator, requirePermission } from '@/middleware'
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
  requestValidator('query', getAdminsQuerySchema),
  requirePermission(Permission.ViewAdmins),
  getAdminsHandler
)

ownerAdminsRoute.post(
  '/admins',
  requestValidator('json', createAdminBodySchema),
  requirePermission(Permission.ManageAdmins),
  createAdminHandler
)

ownerAdminsRoute.get(
  '/admins/default-permissions',
  requirePermission(Permission.ViewAdmins),
  getAdminDefaultPermissionsHandler
)

ownerAdminsRoute.route('/admins/:adminId', ownerAdminByIdRoute)
