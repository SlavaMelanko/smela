import { Hono } from 'hono'

import type { AppContext } from '@/context'

import {
  requirePermission,
  requireTeamAccess,
  validateBody,
  validateParams
} from '@/middleware'
import { Permission } from '@/types'

import { getTeamHandler, updateTeamHandler } from './handler'
import { teamsMembersRoute } from './members'
import { teamIdParamsSchema, updateTeamBodySchema } from './schema'

export const teamByIdRoute = new Hono<AppContext>()

teamByIdRoute.get(
  '/',
  validateParams(teamIdParamsSchema),
  requirePermission(Permission.ViewTeams),
  requireTeamAccess,
  getTeamHandler
)

teamByIdRoute.patch(
  '/',
  validateParams(teamIdParamsSchema),
  validateBody(updateTeamBodySchema),
  requirePermission(Permission.ManageTeams),
  requireTeamAccess,
  updateTeamHandler
)

teamByIdRoute.route('/members', teamsMembersRoute)
