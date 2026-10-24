import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { AppError, ErrorCode } from '@/errors'
import { requireTeamAccess, validateBody, validateParams } from '@/middleware'
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
  requireTeamAccess(Permission.ViewTeams),
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
  requireTeamAccess(Permission.ManageTeams),
  async c => {
    const { id: currentUserId, role } = c.get('user')
    const team = c.get('team')!
    const targetMember = c.get('targetMember')!
    const { permissions } = c.req.valid('json')

    // Compare the DB-resolved ID so the guard holds even if param normalization changes
    if (targetMember.id === currentUserId) {
      throw new AppError(ErrorCode.Forbidden, 'Cannot edit own permissions')
    }

    const result = await updateTeamMemberPermissions(
      team,
      targetMember,
      role,
      permissions
    )

    return c.json(result, HttpStatus.OK)
  }
)
