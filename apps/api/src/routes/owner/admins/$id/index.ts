import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody, validateParams } from '@/middleware'
import { Permission } from '@/types'

import {
  cancelAdminInviteHandler,
  getAdminHandler,
  resendAdminInviteHandler,
  updateAdminHandler
} from './handler'
import { ownerAdminPermissionsRoute } from './permissions'
import { adminIdParamsSchema, updateAdminBodySchema } from './schema'

export const ownerAdminByIdRoute = new Hono<AppContext>()

ownerAdminByIdRoute.get(
  '/',
  validateParams(adminIdParamsSchema),
  requirePermission(Permission.ViewAdmins),
  getAdminHandler
)

ownerAdminByIdRoute.patch(
  '/',
  validateParams(adminIdParamsSchema),
  validateBody(updateAdminBodySchema),
  requirePermission(Permission.ManageAdmins),
  updateAdminHandler
)

ownerAdminByIdRoute.post(
  '/resend-invite',
  validateParams(adminIdParamsSchema),
  requirePermission(Permission.ManageAdmins),
  resendAdminInviteHandler
)

ownerAdminByIdRoute.post(
  '/cancel-invite',
  validateParams(adminIdParamsSchema),
  requirePermission(Permission.ManageAdmins),
  cancelAdminInviteHandler
)

ownerAdminByIdRoute.route('/permissions', ownerAdminPermissionsRoute)
