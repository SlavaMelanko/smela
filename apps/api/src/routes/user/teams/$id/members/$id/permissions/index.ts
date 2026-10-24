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
    const { id: currentUserId } = c.get('user')
    const { id: targetUserId, membershipId } = c.get('targetMember')!
    const { permissions } = c.req.valid('json')

    // Compare the DB-resolved ID, since the URL may spell the UUID in a different case
    if (targetUserId === currentUserId) {
      throw new AppError(ErrorCode.Forbidden, 'Cannot edit own permissions')
    }

    const result = await updateTeamMemberPermissions(membershipId, permissions)

    return c.json(result, HttpStatus.OK)
  }
)
