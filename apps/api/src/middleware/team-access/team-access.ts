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
 * Note: teamId is already validated by validateParams middleware
 */
export const requireTeamAccess = createMiddleware<AppContext>(
  async (c, next) => {
    const teamId = c.req.param('teamId')!
    const { id: userId, role } = c.get('user')

    // Admins bypass team membership check
    if (isAdmin(role)) {
      return next()
    }

    // Regular users must be team members
    const membership = await teamRepo.findMember(teamId, userId)

    if (!membership) {
      throw new AppError(ErrorCode.Forbidden)
    }

    return next()
  }
)
