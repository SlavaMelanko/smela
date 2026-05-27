import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requireTeamAccess, validateBody, validateParams } from '@/middleware'

import { teamsMemberByIdRoute } from './$id'
import {
  createMemberHandler,
  getMemberDefaultPermissionsHandler,
  getTeamMembersHandler
} from './handler'
import { inviteMemberBodySchema, teamIdParamsSchema } from './schema'

export const teamsMembersRoute = new Hono<AppContext>()

teamsMembersRoute.get(
  '/',
  validateParams(teamIdParamsSchema),
  requireTeamAccess,
  getTeamMembersHandler
)

teamsMembersRoute.post(
  '/',
  validateParams(teamIdParamsSchema),
  validateBody(inviteMemberBodySchema),
  requireTeamAccess,
  createMemberHandler
)

teamsMembersRoute.get(
  '/default-permissions',
  validateParams(teamIdParamsSchema),
  requireTeamAccess,
  getMemberDefaultPermissionsHandler
)

teamsMembersRoute.route('/:memberId', teamsMemberByIdRoute)
