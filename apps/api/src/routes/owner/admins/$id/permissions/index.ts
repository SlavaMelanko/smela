import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody, validateParams } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import { getAdminPermissions, updateAdminPermissions } from '@/use-cases/owner'

import { adminIdParamsSchema, updateAdminPermissionsBodySchema } from './schema'

export const ownerAdminPermissionsRoute = new Hono<AppContext>()

ownerAdminPermissionsRoute.get(
  '/',
  validateParams(adminIdParamsSchema),
  requirePermission(Permission.ViewAdmins),
  async c => {
    const { adminId } = c.req.valid('param')

    const result = await getAdminPermissions(adminId)

    return c.json(result, HttpStatus.OK)
  }
)

ownerAdminPermissionsRoute.patch(
  '/',
  validateParams(adminIdParamsSchema),
  validateBody(updateAdminPermissionsBodySchema),
  requirePermission(Permission.ManageAdmins),
  async c => {
    const { adminId } = c.req.valid('param')
    const { permissions } = c.req.valid('json')

    const result = await updateAdminPermissions(adminId, permissions)

    return c.json(result, HttpStatus.OK)
  }
)
