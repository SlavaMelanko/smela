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
  requireTeamAccess,
  requireTeamPermission(Permission.ViewTeams),
  async c => {
    const { membershipId } = c.get('targetMember')!

    const result = await getTeamMemberPermissions(membershipId)

    return c.json(result, HttpStatus.OK)
  }
)

teamMemberPermissionsRoute.patch(
  '/',
  validateParams(memberPermissionsParamsSchema),
  validateBody(updateMemberPermissionsBodySchema),
  requireTeamAccess,
  requireTeamPermission(Permission.ManageTeams),
  async c => {
    const { membershipId } = c.get('targetMember')!
    const { permissions } = c.req.valid('json')

    const result = await updateTeamMemberPermissions(membershipId, permissions)

    return c.json(result, HttpStatus.OK)
  }
)
