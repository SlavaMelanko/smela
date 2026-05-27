import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody, validateQuery } from '@/middleware'

import { createTeamHandler, getTeamsHandler } from './handler'
import { createTeamBodySchema, getTeamsQuerySchema } from './schema'

export const adminTeamsRoute = new Hono<AppContext>()

adminTeamsRoute.get(
  '/teams',
  validateQuery(getTeamsQuerySchema),
  getTeamsHandler
)

adminTeamsRoute.post(
  '/teams',
  validateBody(createTeamBodySchema),
  createTeamHandler
)
