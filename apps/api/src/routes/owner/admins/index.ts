import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody, validateQuery } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { getAdminDefaultPermissions, Permission } from '@/types'
import { getAdmins, inviteAdmin } from '@/use-cases/owner'

import { ownerAdminByIdRoute } from './$id'
import { createAdminBodySchema, getAdminsQuerySchema } from './schema'

export const ownerAdminsRoute = new Hono<AppContext>()

ownerAdminsRoute.get(
  '/admins',
  validateQuery(getAdminsQuerySchema),
  requirePermission(Permission.ViewAdmins),
  async c => {
    const { search, statuses, page, limit } = c.req.valid('query')

    const filters = { search, roles: [], statuses }
    const pagination = { page, limit }
    const { data, pagination: paginationResult } = await getAdmins(
      filters,
      pagination
    )

    return c.json({ ...data, pagination: paginationResult }, HttpStatus.OK)
  }
)

ownerAdminsRoute.post(
  '/admins',
  validateBody(createAdminBodySchema),
  requirePermission(Permission.ManageAdmins),
  async c => {
    const body = c.req.valid('json')
    const { id: inviterId } = c.get('user')

    const result = await inviteAdmin(body, inviterId)

    return c.json(result, HttpStatus.CREATED)
  }
)

ownerAdminsRoute.get(
  '/admins/default-permissions',
  requirePermission(Permission.ViewAdmins),
  c => {
    return c.json({ permissions: getAdminDefaultPermissions() }, HttpStatus.OK)
  }
)

ownerAdminsRoute.route('/admins/:adminId', ownerAdminByIdRoute)
