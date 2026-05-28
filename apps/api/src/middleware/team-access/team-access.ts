import type { Context } from 'hono'

import { createMiddleware } from 'hono/factory'

import type { AppContext } from '@/context'

import { teamRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { isAdmin } from '@/types'

/**
 * Team access middleware - ensures user has access to the team.
 *
 * IMPORTANT: Must be used in strict chain with requirePermission middleware:
 * 1. First: requirePermission with either Permission.ViewTeams or Permission.ManageTeams
 * 2. Then: requireTeamAccess (this middleware)
 *
 * Logic:
 * - Always validates team existence
 * - For routes with memberId: validates target member exists in team
 * - For admins: only validates team/member existence (permissions already checked)
 * - For regular users: validates both current user AND target member access
 *
 * Note: teamId is already validated by validateParams middleware
 */

const resolveAdminContext = async (
  c: Context<AppContext>,
  teamId: string,
  memberId: string | undefined
) => {
  c.set('currentUser', undefined)
  if (!memberId) {
    return
  }

  const targetMember = await teamRepo.findMember(teamId, memberId)
  if (!targetMember) {
    throw new AppError(ErrorCode.NotFound, 'Member not found')
  }
  c.set('targetMember', targetMember)
}

const resolveUserContext = async (
  c: Context<AppContext>,
  teamId: string,
  currentUserId: string,
  memberId: string | undefined
) => {
  if (memberId) {
    const [currentUser, targetMember] = await Promise.all([
      teamRepo.findMember(teamId, currentUserId),
      teamRepo.findMember(teamId, memberId)
    ])

    if (!currentUser) {
      throw new AppError(ErrorCode.Forbidden, 'Access denied to team')
    }
    if (!targetMember) {
      throw new AppError(ErrorCode.NotFound, 'Member not found')
    }

    c.set('currentUser', currentUser)
    c.set('targetMember', targetMember)
  } else {
    const currentUser = await teamRepo.findMember(teamId, currentUserId)
    if (!currentUser) {
      throw new AppError(ErrorCode.Forbidden, 'Access denied to team')
    }

    c.set('currentUser', currentUser)
    c.set('targetMember', undefined)
  }
}

export const requireTeamAccess = createMiddleware<AppContext>(
  async (c, next) => {
    const teamId = c.req.param('teamId')!
    const memberId = c.req.param('memberId')
    const { id: currentUserId, role } = c.get('user')

    const team = await teamRepo.find(teamId)
    if (!team) {
      throw new AppError(ErrorCode.NotFound, 'Team not found')
    }

    c.set('team', team)

    if (isAdmin(role)) {
      await resolveAdminContext(c, teamId, memberId)
    } else {
      await resolveUserContext(c, teamId, currentUserId, memberId)
    }

    return next()
  }
)
