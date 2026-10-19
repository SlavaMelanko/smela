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
import {
  getTeamMemberPermissions,
  updateTeamMemberPermissions
} from '@/use-cases/user'

import {
  memberPermissionsParamsSchema,
  updateMemberPermissionsBodySchema
} from './schema'

export const teamMemberPermissionsRoute = new Hono<AppContext>()

teamMemberPermissionsRoute.get(
  '/',
  validateParams(memberPermissionsParamsSchema),
  requirePermission(Permission.ViewTeams),
  requireTeamAccess,
  async c => {
    const { teamId, memberId } = c.req.valid('param')

    const result = await getTeamMemberPermissions(teamId, memberId)

    return c.json(result, HttpStatus.OK)
  }
)

teamMemberPermissionsRoute.patch(
  '/',
  validateParams(memberPermissionsParamsSchema),
  validateBody(updateMemberPermissionsBodySchema),
  requirePermission(Permission.ManageTeams),
  requireTeamAccess,
  async c => {
    const { teamId, memberId } = c.req.valid('param')
    const { permissions } = c.req.valid('json')

    const result = await updateTeamMemberPermissions(
      teamId,
      memberId,
      permissions
    )

    return c.json(result, HttpStatus.OK)
  }
)
