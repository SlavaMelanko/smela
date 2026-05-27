import { Hono } from 'hono'

import type { AppContext } from '@/context'

import {
  teamAccessMiddleware,
  validateBody,
  validateParams
} from '@/middleware'

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
  teamAccessMiddleware,
  getTeamMembersHandler
)

teamsMembersRoute.post(
  '/',
  validateParams(teamIdParamsSchema),
  validateBody(inviteMemberBodySchema),
  teamAccessMiddleware,
  createMemberHandler
)

teamsMembersRoute.get(
  '/default-permissions',
  validateParams(teamIdParamsSchema),
  teamAccessMiddleware,
  getMemberDefaultPermissionsHandler
)

teamsMembersRoute.route('/:memberId', teamsMemberByIdRoute)
