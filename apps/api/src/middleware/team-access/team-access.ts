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
export const requireTeamAccess = createMiddleware<AppContext>(
  async (c, next) => {
    const teamId = c.req.param('teamId')!
    const memberId = c.req.param('memberId') // Optional - only on member-specific routes
    const { id: currentUserId, role } = c.get('user')

    // Step 1: Always verify team exists (for all users)
    const team = await teamRepo.find(teamId)
    if (!team) {
      throw new AppError(ErrorCode.NotFound, 'Team not found')
    }

    // Step 2: Role-based member validation
    if (isAdmin(role)) {
      // Admins: Only validate target member exists (if applicable)
      if (memberId) {
        const targetMember = await teamRepo.findMember(teamId, memberId)
        if (!targetMember) {
          throw new AppError(ErrorCode.NotFound, 'Member not found')
        }
      }
    } else {
      // Regular users: Must be team members + validate target member (if applicable)
      if (memberId) {
        // Member-specific routes: validate both current user and target member
        const [currentUserMember, targetMember] = await Promise.all([
          teamRepo.findMember(teamId, currentUserId),
          teamRepo.findMember(teamId, memberId)
        ])

        if (!currentUserMember) {
          throw new AppError(ErrorCode.Forbidden, 'Access denied to team')
        }
        if (!targetMember) {
          throw new AppError(ErrorCode.NotFound, 'Member not found')
        }
      } else {
        // Team-only routes: validate current user is team member
        const currentUserMember = await teamRepo.findMember(
          teamId,
          currentUserId
        )
        if (!currentUserMember) {
          throw new AppError(ErrorCode.Forbidden, 'Access denied to team')
        }
      }
    }

    return next()
  }
)
