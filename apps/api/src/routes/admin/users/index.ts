import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateQuery } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import { searchUsers } from '@/use-cases/admin'

import { adminUserByIdRoute } from './$id'
import { getUsersQuerySchema } from './schema'

export const adminUsersRoute = new Hono<AppContext>()

adminUsersRoute.get(
  '/users',
  validateQuery(getUsersQuerySchema),
  requirePermission(Permission.ViewUsers),
  async c => {
    const { search, roles, statuses, page, limit } = c.req.valid('query')

    const filters = { search, roles, statuses }
    const pagination = { page, limit }
    const { data, pagination: paginationResult } = await searchUsers(
      filters,
      pagination
    )

    return c.json({ ...data, pagination: paginationResult }, HttpStatus.OK)
  }
)

adminUsersRoute.route('/users/:id', adminUserByIdRoute)
