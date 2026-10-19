import { Hono } from 'hono'

import type { AppContext } from '@/context'

import {
  requireTeamAccess,
  requireTeamPermission,
  validateBody,
  validateParams
} from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import { switchTeam, updateTeam } from '@/use-cases/user'

import { teamsMembersRoute } from './members'
import { teamIdParamsSchema, updateTeamBodySchema } from './schema'

export const teamByIdRoute = new Hono<AppContext>()

teamByIdRoute.get(
  '/',
  validateParams(teamIdParamsSchema),
  requireTeamAccess,
  requireTeamPermission(Permission.ViewTeams),
  async c => {
    const team = c.get('team')

    return c.json({ team }, HttpStatus.OK)
  }
)

teamByIdRoute.patch(
  '/',
  validateParams(teamIdParamsSchema),
  validateBody(updateTeamBodySchema),
  requireTeamAccess,
  requireTeamPermission(Permission.ManageTeams),
  async c => {
    const { teamId } = c.req.valid('param')
    const body = c.req.valid('json')

    const result = await updateTeam(teamId, body)

    return c.json(result, HttpStatus.OK)
  }
)

// Membership is checked by the update itself, so no team-access guard
teamByIdRoute.post('/switch', validateParams(teamIdParamsSchema), async c => {
  const { id: userId } = c.get('user')
  const { teamId } = c.req.valid('param')

  const result = await switchTeam(userId, teamId)

  return c.json(result, HttpStatus.OK)
})

teamByIdRoute.route('/members', teamsMembersRoute)
