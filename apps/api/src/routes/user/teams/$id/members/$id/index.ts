import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requireTeamAccess, validateBody, validateParams } from '@/middleware'

import {
  cancelMemberInviteHandler,
  getTeamMemberHandler,
  removeTeamMemberHandler,
  resendMemberInviteHandler,
  updateTeamMemberHandler
} from './handler'
import { memberIdParamsSchema, updateTeamMemberBodySchema } from './schema'

export const teamsMemberByIdRoute = new Hono<AppContext>()

teamsMemberByIdRoute.get(
  '/',
  validateParams(memberIdParamsSchema),
  requireTeamAccess,
  getTeamMemberHandler
)

teamsMemberByIdRoute.patch(
  '/',
  validateParams(memberIdParamsSchema),
  validateBody(updateTeamMemberBodySchema),
  requireTeamAccess,
  updateTeamMemberHandler
)

teamsMemberByIdRoute.delete(
  '/',
  validateParams(memberIdParamsSchema),
  requireTeamAccess,
  removeTeamMemberHandler
)

teamsMemberByIdRoute.post(
  '/resend-invite',
  validateParams(memberIdParamsSchema),
  requireTeamAccess,
  resendMemberInviteHandler
)

teamsMemberByIdRoute.post(
  '/cancel-invite',
  validateParams(memberIdParamsSchema),
  requireTeamAccess,
  cancelMemberInviteHandler
)
