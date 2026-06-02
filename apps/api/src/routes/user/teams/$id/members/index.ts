import { Hono } from 'hono'

import type { AppContext } from '@/context'

import {
  requirePermission,
  requireTeamAccess,
  validateBody,
  validateParams
} from '@/middleware'
import { Permission } from '@/types'

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
  requirePermission(Permission.ViewTeams),
  requireTeamAccess,
  getTeamMembersHandler
)

teamsMembersRoute.post(
  '/',
  validateParams(teamIdParamsSchema),
  validateBody(inviteMemberBodySchema),
  requirePermission(Permission.ManageTeams),
  requireTeamAccess,
  createMemberHandler
)

teamsMembersRoute.get(
  '/default-permissions',
  validateParams(teamIdParamsSchema),
  requirePermission(Permission.ViewTeams),
  requireTeamAccess,
  getMemberDefaultPermissionsHandler
)

teamsMembersRoute.route('/:memberId', teamsMemberByIdRoute)
