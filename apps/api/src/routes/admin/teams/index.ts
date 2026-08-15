import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody, validateQuery } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import { createTeam, getTeams } from '@/use-cases/admin'

import { createTeamBodySchema, getTeamsQuerySchema } from './schema'

export const adminTeamsRoute = new Hono<AppContext>()

adminTeamsRoute.get(
  '/teams',
  validateQuery(getTeamsQuerySchema),
  requirePermission(Permission.ViewTeams),
  async c => {
    const { search, page, limit } = c.req.valid('query')

    const filters = { search }
    const pagination = { page, limit }
    const result = await getTeams(filters, pagination)

    return c.json(result, HttpStatus.OK)
  }
)

adminTeamsRoute.post(
  '/teams',
  validateBody(createTeamBodySchema),
  requirePermission(Permission.ManageTeams),
  async c => {
    const body = c.req.valid('json')

    const result = await createTeam(body)

    return c.json(result, HttpStatus.CREATED)
  }
)
