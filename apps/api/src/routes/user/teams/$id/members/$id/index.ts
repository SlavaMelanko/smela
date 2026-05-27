import { Hono } from 'hono'

import type { AppContext } from '@/context'

import {
  teamAccessMiddleware,
  validateBody,
  validateParams
} from '@/middleware'

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
  teamAccessMiddleware,
  getTeamMemberHandler
)

teamsMemberByIdRoute.patch(
  '/',
  validateParams(memberIdParamsSchema),
  validateBody(updateTeamMemberBodySchema),
  teamAccessMiddleware,
  updateTeamMemberHandler
)

teamsMemberByIdRoute.delete(
  '/',
  validateParams(memberIdParamsSchema),
  teamAccessMiddleware,
  removeTeamMemberHandler
)

teamsMemberByIdRoute.post(
  '/resend-invite',
  validateParams(memberIdParamsSchema),
  teamAccessMiddleware,
  resendMemberInviteHandler
)

teamsMemberByIdRoute.post(
  '/cancel-invite',
  validateParams(memberIdParamsSchema),
  teamAccessMiddleware,
  cancelMemberInviteHandler
)
