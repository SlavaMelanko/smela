import { Hono } from 'hono'

import type { AppContext } from '@/context'

import {
  requirePermission,
  requireTeamAccess,
  validateBody,
  validateParams
} from '@/middleware'
import { HttpStatus } from '@/net/http'
import { getMemberDefaultPermissions, Permission } from '@/types'
import { getTeamMembers, inviteMember } from '@/use-cases/user'

import { teamsMemberByIdRoute } from './$id'
import { inviteMemberBodySchema, teamIdParamsSchema } from './schema'

export const teamsMembersRoute = new Hono<AppContext>()

teamsMembersRoute.get(
  '/',
  validateParams(teamIdParamsSchema),
  requirePermission(Permission.ViewTeams),
  requireTeamAccess,
  async c => {
    const { teamId } = c.req.valid('param')

    const result = await getTeamMembers(teamId)

    return c.json(result, HttpStatus.OK)
  }
)

teamsMembersRoute.post(
  '/',
  validateParams(teamIdParamsSchema),
  validateBody(inviteMemberBodySchema),
  requirePermission(Permission.ManageTeams),
  requireTeamAccess,
  async c => {
    const team = c.get('team')!
    const member = c.req.valid('json')
    const { id: inviterId } = c.get('user')

    const result = await inviteMember(team, member, inviterId)

    return c.json(result, HttpStatus.CREATED)
  }
)

teamsMembersRoute.get(
  '/default-permissions',
  validateParams(teamIdParamsSchema),
  requirePermission(Permission.ViewTeams),
  requireTeamAccess,
  c => {
    return c.json({ permissions: getMemberDefaultPermissions() }, HttpStatus.OK)
  }
)

teamsMembersRoute.route('/:memberId', teamsMemberByIdRoute)
