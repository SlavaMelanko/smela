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
  getTeamMemberPermissionsHandler,
  updateTeamMemberPermissionsHandler
} from './handler'
import {
  memberPermissionsParamsSchema,
  updateMemberPermissionsBodySchema
} from './schema'

export const teamMemberPermissionsRoute = new Hono<AppContext>()

teamMemberPermissionsRoute.get(
  '/',
  validateParams(memberPermissionsParamsSchema),
  requirePermission(Permission.ViewTeams),
  requireTeamAccess,
  getTeamMemberPermissionsHandler
)

teamMemberPermissionsRoute.patch(
  '/',
  validateParams(memberPermissionsParamsSchema),
  validateBody(updateMemberPermissionsBodySchema),
  requirePermission(Permission.ManageTeams),
  requireTeamAccess,
  updateTeamMemberPermissionsHandler
)
