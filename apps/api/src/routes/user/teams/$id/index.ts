import { Hono } from 'hono'

import type { AppContext } from '@/context'

import {
  teamAccessMiddleware,
  validateBody,
  validateParams
} from '@/middleware'

import { getTeamHandler, updateTeamHandler } from './handler'
import { teamsMembersRoute } from './members'
import { teamIdParamsSchema, updateTeamBodySchema } from './schema'

export const teamByIdRoute = new Hono<AppContext>()

teamByIdRoute.get(
  '/',
  validateParams(teamIdParamsSchema),
  teamAccessMiddleware,
  getTeamHandler
)

teamByIdRoute.patch(
  '/',
  validateParams(teamIdParamsSchema),
  validateBody(updateTeamBodySchema),
  teamAccessMiddleware,
  updateTeamHandler
)

teamByIdRoute.route('/members', teamsMembersRoute)
