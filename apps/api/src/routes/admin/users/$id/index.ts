import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody, validateParams } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import { getUser, updateUser } from '@/use-cases/admin'

import { updateUserBodySchema, userIdParamsSchema } from './schema'

export const adminUserByIdRoute = new Hono<AppContext>()

adminUserByIdRoute.get(
  '/',
  validateParams(userIdParamsSchema),
  requirePermission(Permission.ViewUsers),
  async c => {
    const { id } = c.req.valid('param')

    const result = await getUser(id)

    return c.json(result, HttpStatus.OK)
  }
)

adminUserByIdRoute.patch(
  '/',
  validateParams(userIdParamsSchema),
  validateBody(updateUserBodySchema),
  requirePermission(Permission.ManageUsers),
  async c => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    const result = await updateUser(id, body)

    return c.json(result, HttpStatus.OK)
  }
)
