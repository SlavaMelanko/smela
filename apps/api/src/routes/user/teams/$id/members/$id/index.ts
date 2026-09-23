import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { AppError, ErrorCode } from '@/errors'
import {
  requirePermission,
  requireSelfOrPermission,
  requireTeamAccess,
  validateBody,
  validateParams
} from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import {
  cancelMemberInvite,
  removeTeamMember,
  resendMemberInvite,
  updateTeamMember
} from '@/use-cases/user'

import { teamMemberPermissionsRoute } from './permissions'
import { memberIdParamsSchema, updateTeamMemberBodySchema } from './schema'

export const teamsMemberByIdRoute = new Hono<AppContext>()

teamsMemberByIdRoute.route('/permissions', teamMemberPermissionsRoute)

teamsMemberByIdRoute.get(
  '/',
  validateParams(memberIdParamsSchema),
  requirePermission(Permission.ViewTeams),
  requireTeamAccess,
  async c => {
    const targetMember = c.get('targetMember')!

    return c.json({ member: targetMember }, HttpStatus.OK)
  }
)

teamsMemberByIdRoute.patch(
  '/',
  validateParams(memberIdParamsSchema),
  validateBody(updateTeamMemberBodySchema),
  requireSelfOrPermission(Permission.ManageTeams),
  requireTeamAccess,
  async c => {
    const { teamId, memberId } = c.req.valid('param')
    const body = c.req.valid('json')
    const { id: currentUserId, permissions } = c.get('user')

    const isSelf = currentUserId === memberId
    const canManage = permissions?.includes(Permission.ManageTeams) ?? false

    // Prevent self-updating users from changing membership fields (e.g. position)
    if (isSelf && !canManage && body.membership) {
      throw new AppError(ErrorCode.Forbidden)
    }

    const result = await updateTeamMember(teamId, memberId, body)

    return c.json(result, HttpStatus.OK)
  }
)

teamsMemberByIdRoute.delete(
  '/',
  validateParams(memberIdParamsSchema),
  requirePermission(Permission.ManageTeams),
  requireTeamAccess,
  async c => {
    const { teamId, memberId } = c.req.valid('param')

    const result = await removeTeamMember(teamId, memberId)

    return c.json(result, HttpStatus.OK)
  }
)

teamsMemberByIdRoute.post(
  '/resend-invite',
  validateParams(memberIdParamsSchema),
  requirePermission(Permission.ManageTeams),
  requireTeamAccess,
  async c => {
    const team = c.get('team')!
    const targetMember = c.get('targetMember')!
    const { id: inviterId } = c.get('user')

    const result = await resendMemberInvite(team, targetMember, inviterId)

    return c.json(result, HttpStatus.OK)
  }
)

teamsMemberByIdRoute.post(
  '/cancel-invite',
  validateParams(memberIdParamsSchema),
  requirePermission(Permission.ManageTeams),
  requireTeamAccess,
  async c => {
    const targetMember = c.get('targetMember')!

    const result = await cancelMemberInvite(targetMember)

    return c.json(result, HttpStatus.OK)
  }
)
