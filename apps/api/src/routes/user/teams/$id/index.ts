import { Hono } from 'hono'

import type { AppContext } from '@/context'

import {
  requirePermission,
  requireTeamAccess,
  validateBody,
  validateParams
} from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import { updateTeam } from '@/use-cases/user'

import { teamsMembersRoute } from './members'
import { teamIdParamsSchema, updateTeamBodySchema } from './schema'

export const teamByIdRoute = new Hono<AppContext>()

teamByIdRoute.get(
  '/',
  validateParams(teamIdParamsSchema),
  requirePermission(Permission.ViewTeams),
  requireTeamAccess,
  async c => {
    const team = c.get('team')

    return c.json({ team }, HttpStatus.OK)
  }
)

teamByIdRoute.patch(
  '/',
  validateParams(teamIdParamsSchema),
  validateBody(updateTeamBodySchema),
  requirePermission(Permission.ManageTeams),
  requireTeamAccess,
  async c => {
    const { teamId } = c.req.valid('param')
    const body = c.req.valid('json')

    const result = await updateTeam(teamId, body)

    return c.json(result, HttpStatus.OK)
  }
)

teamByIdRoute.route('/members', teamsMembersRoute)
