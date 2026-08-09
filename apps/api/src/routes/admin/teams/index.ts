import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody, validateQuery } from '@/middleware'
import { Permission } from '@/types'

import { createTeamHandler, getTeamsHandler } from './handler'
import { createTeamBodySchema, getTeamsQuerySchema } from './schema'

export const adminTeamsRoute = new Hono<AppContext>()

adminTeamsRoute.get(
  '/teams',
  validateQuery(getTeamsQuerySchema),
  requirePermission(Permission.ViewTeams),
  getTeamsHandler
)

adminTeamsRoute.post(
  '/teams',
  validateBody(createTeamBodySchema),
  requirePermission(Permission.ManageTeams),
  createTeamHandler
)
