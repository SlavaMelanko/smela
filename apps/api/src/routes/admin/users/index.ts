import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateQuery } from '@/middleware'

import { adminUserByIdRoute } from './$id'
import { getUsersHandler } from './handler'
import { getUsersQuerySchema } from './schema'

export const adminUsersRoute = new Hono<AppContext>()

adminUsersRoute.get(
  '/users',
  validateQuery(getUsersQuerySchema),
  getUsersHandler
)

adminUsersRoute.route('/users/:id', adminUserByIdRoute)
