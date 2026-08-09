import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateQuery } from '@/middleware'
import { Permission } from '@/types'

import { adminUserByIdRoute } from './$id'
import { getUsersHandler } from './handler'
import { getUsersQuerySchema } from './schema'

export const adminUsersRoute = new Hono<AppContext>()

adminUsersRoute.get(
  '/users',
  validateQuery(getUsersQuerySchema),
  requirePermission(Permission.ViewUsers),
  getUsersHandler
)

adminUsersRoute.route('/users/:id', adminUserByIdRoute)
