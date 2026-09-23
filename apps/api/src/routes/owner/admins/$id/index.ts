import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody, validateParams } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import {
  cancelAdminInvite,
  getAdmin,
  resendAdminInvite,
  updateAdmin
} from '@/use-cases/owner'

import { ownerAdminPermissionsRoute } from './permissions'
import { adminIdParamsSchema, updateAdminBodySchema } from './schema'

export const ownerAdminByIdRoute = new Hono<AppContext>()

ownerAdminByIdRoute.get(
  '/',
  validateParams(adminIdParamsSchema),
  requirePermission(Permission.ViewAdmins),
  async c => {
    const { adminId } = c.req.valid('param')

    const result = await getAdmin(adminId)

    return c.json(result, HttpStatus.OK)
  }
)

ownerAdminByIdRoute.patch(
  '/',
  validateParams(adminIdParamsSchema),
  validateBody(updateAdminBodySchema),
  requirePermission(Permission.ManageAdmins),
  async c => {
    const { adminId } = c.req.valid('param')
    const body = c.req.valid('json')

    const result = await updateAdmin(adminId, body)

    return c.json(result, HttpStatus.OK)
  }
)

ownerAdminByIdRoute.post(
  '/resend-invite',
  validateParams(adminIdParamsSchema),
  requirePermission(Permission.ManageAdmins),
  async c => {
    const { adminId } = c.req.valid('param')
    const { id: inviterId } = c.get('user')

    const result = await resendAdminInvite(adminId, inviterId)

    return c.json(result, HttpStatus.OK)
  }
)

ownerAdminByIdRoute.post(
  '/cancel-invite',
  validateParams(adminIdParamsSchema),
  requirePermission(Permission.ManageAdmins),
  async c => {
    const { adminId } = c.req.valid('param')

    const result = await cancelAdminInvite(adminId)

    return c.json(result, HttpStatus.OK)
  }
)

ownerAdminByIdRoute.route('/permissions', ownerAdminPermissionsRoute)
