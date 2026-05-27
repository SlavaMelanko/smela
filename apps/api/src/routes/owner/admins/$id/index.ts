import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requestValidator, requirePermission } from '@/middleware'
import Permission from '@/types/permission'

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
  requestValidator('param', adminIdParamsSchema),
  requirePermission(Permission.ViewAdmins),
  getAdminHandler
)

ownerAdminByIdRoute.patch(
  '/',
  requestValidator('param', adminIdParamsSchema),
  requestValidator('json', updateAdminBodySchema),
  requirePermission(Permission.ManageAdmins),
  updateAdminHandler
)

ownerAdminByIdRoute.post(
  '/resend-invite',
  requestValidator('param', adminIdParamsSchema),
  requirePermission(Permission.ManageAdmins),
  resendAdminInviteHandler
)

ownerAdminByIdRoute.post(
  '/cancel-invite',
  requestValidator('param', adminIdParamsSchema),
  requirePermission(Permission.ManageAdmins),
  cancelAdminInviteHandler
)

ownerAdminByIdRoute.route('/permissions', ownerAdminPermissionsRoute)
