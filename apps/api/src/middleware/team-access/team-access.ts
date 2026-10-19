import type { Context } from 'hono'

import { createMiddleware } from 'hono/factory'

import type { AppContext } from '@/context'

import { teamRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { isAdmin } from '@/types'
import { resolveMemberPermissionList } from '@/use-cases/resolve-permissions'

/**
 * Team access middleware - ensures user has access to the team.
 *
 * IMPORTANT: Must run before requireTeamPermission or requireSelfOrTeamPermission,
 * which check the teamPermissions this middleware sets.
 *
 * Logic:
 * - Always validates team existence
 * - For routes with memberId: validates target member exists in team
 * - For admins: only validates team/member existence; team permissions come from their claims
 * - For regular users: validates both current user AND target member access;
 *   team permissions come from the current user's membership
 *
 * Note: teamId is already validated by validateParams middleware
 */

const handleAdminAccess = async (
  c: Context<AppContext>,
  teamId: string,
  memberId: string | undefined
) => {
  c.set('teamPermissions', c.get('user').permissions ?? [])

  if (!memberId) {
    return
  }

  const targetMember = await teamRepo.findMember(teamId, memberId)
  if (!targetMember) {
    throw new AppError(ErrorCode.NotFound, 'Member not found')
  }

  c.set('targetMember', targetMember)
}

const handleUserAccess = async (
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
  }

  const { membershipId } = c.get('currentUser')!
  c.set('teamPermissions', await resolveMemberPermissionList(membershipId))
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
      await handleAdminAccess(c, teamId, memberId)
    } else {
      await handleUserAccess(c, teamId, currentUserId, memberId)
    }

    return next()
  }
)
