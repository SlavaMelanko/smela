import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requireTeamAccess, validateBody, validateParams } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import {
  acceptTeamInvite,
  declineTeamInvite,
  switchTeam,
  updateTeam
} from '@/use-cases/user'

import { teamsMembersRoute } from './members'
import { teamIdParamsSchema, updateTeamBodySchema } from './schema'

export const teamByIdRoute = new Hono<AppContext>()

teamByIdRoute.get(
  '/',
  validateParams(teamIdParamsSchema),
  requireTeamAccess(Permission.ViewTeams),
  async c => {
    const team = c.get('team')

    return c.json({ team }, HttpStatus.OK)
  }
)

teamByIdRoute.patch(
  '/',
  validateParams(teamIdParamsSchema),
  validateBody(updateTeamBodySchema),
  requireTeamAccess(Permission.ManageTeams),
  async c => {
    const { teamId } = c.req.valid('param')
    const body = c.req.valid('json')

    const result = await updateTeam(teamId, body)

    return c.json(result, HttpStatus.OK)
  }
)

// No requireTeamAccess: markMemberLastActive only matches the caller's own membership row
teamByIdRoute.post('/switch', validateParams(teamIdParamsSchema), async c => {
  const { id: userId } = c.get('user')
  const { teamId } = c.req.valid('param')

  const result = await switchTeam(userId, teamId)

  return c.json(result, HttpStatus.OK)
})

// No requireTeamAccess: a pending invite grants no team access,
// and the use case only matches the caller's own pending membership
teamByIdRoute.post(
  '/accept-invite',
  validateParams(teamIdParamsSchema),
  async c => {
    const { id: userId } = c.get('user')
    const { teamId } = c.req.valid('param')

    const result = await acceptTeamInvite(userId, teamId)

    return c.json(result, HttpStatus.OK)
  }
)

teamByIdRoute.post(
  '/decline-invite',
  validateParams(teamIdParamsSchema),
  async c => {
    const { id: userId } = c.get('user')
    const { teamId } = c.req.valid('param')

    const result = await declineTeamInvite(userId, teamId)

    return c.json(result, HttpStatus.OK)
  }
)

teamByIdRoute.route('/members', teamsMembersRoute)
