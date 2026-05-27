import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requireTeamAccess, validateBody, validateParams } from '@/middleware'

import { getTeamHandler, updateTeamHandler } from './handler'
import { teamsMembersRoute } from './members'
import { teamIdParamsSchema, updateTeamBodySchema } from './schema'

export const teamByIdRoute = new Hono<AppContext>()

teamByIdRoute.get(
  '/',
  validateParams(teamIdParamsSchema),
  requireTeamAccess,
  getTeamHandler
)

teamByIdRoute.patch(
  '/',
  validateParams(teamIdParamsSchema),
  validateBody(updateTeamBodySchema),
  requireTeamAccess,
  updateTeamHandler
)

teamByIdRoute.route('/members', teamsMembersRoute)
