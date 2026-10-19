import { Hono } from 'hono'

import type { AppContext } from '@/context'

import {
  requireTeamAccess,
  requireTeamPermission,
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
  requireTeamAccess,
  requireTeamPermission(Permission.ViewTeams),
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
  requireTeamAccess,
  requireTeamPermission(Permission.ManageTeams),
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
  requireTeamAccess,
  requireTeamPermission(Permission.ViewTeams),
  c => {
    return c.json({ permissions: getMemberDefaultPermissions() }, HttpStatus.OK)
  }
)

teamsMembersRoute.route('/:memberId', teamsMemberByIdRoute)
