import { Hono } from 'hono'

import type { AppContext } from '@/context'

import {
  requirePermission,
  requireTeamAccess,
  validateBody,
  validateParams
} from '@/middleware'
import { Permission } from '@/types'

import {
  cancelMemberInviteHandler,
  getTeamMemberHandler,
  removeTeamMemberHandler,
  resendMemberInviteHandler,
  updateTeamMemberHandler
} from './handler'
import { teamMemberPermissionsRoute } from './permissions'
import { memberIdParamsSchema, updateTeamMemberBodySchema } from './schema'

export const teamsMemberByIdRoute = new Hono<AppContext>()

teamsMemberByIdRoute.route('/permissions', teamMemberPermissionsRoute)

teamsMemberByIdRoute.get(
  '/',
  validateParams(memberIdParamsSchema),
  requirePermission(Permission.ViewTeams),
  requireTeamAccess,
  getTeamMemberHandler
)

teamsMemberByIdRoute.patch(
  '/',
  validateParams(memberIdParamsSchema),
  validateBody(updateTeamMemberBodySchema),
  requirePermission(Permission.ManageTeams),
  requireTeamAccess,
  updateTeamMemberHandler
)

teamsMemberByIdRoute.delete(
  '/',
  validateParams(memberIdParamsSchema),
  requirePermission(Permission.ManageTeams),
  requireTeamAccess,
  removeTeamMemberHandler
)

teamsMemberByIdRoute.post(
  '/resend-invite',
  validateParams(memberIdParamsSchema),
  requirePermission(Permission.ManageTeams),
  requireTeamAccess,
  resendMemberInviteHandler
)

teamsMemberByIdRoute.post(
  '/cancel-invite',
  validateParams(memberIdParamsSchema),
  requirePermission(Permission.ManageTeams),
  requireTeamAccess,
  cancelMemberInviteHandler
)
