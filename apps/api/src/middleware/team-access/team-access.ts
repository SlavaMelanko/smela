import type { Context } from 'hono'

import { createMiddleware } from 'hono/factory'

import type { AppContext } from '@/context'
import type { TeamMemberDetails } from '@/data'
import type { Permission } from '@/types'

import { teamRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { isAdmin, MembershipStatus } from '@/types'
import { resolveMemberPermissionList } from '@/use-cases/resolve-permissions'

/**
 * Team access middleware - ensures user has access to the team and holds the permission.
 *
 * Logic:
 * - Always validates team existence
 * - For routes with memberId: validates target member exists in team
 * - For admins: only validates team/member existence; team permissions come from their claims
 * - For regular users: validates both current user AND target member access;
 *   team permissions come from the current user's membership. Only an active
 *   membership grants access
 * - Requires the permission in team permissions, unless allowSelf is set
 *   and the caller targets their own member record
 *
 * Note: teamId is already validated by validateParams middleware
 */

interface TeamAccessOptions {
  allowSelf?: boolean
}

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

const isJoined = (
  member: TeamMemberDetails | undefined
): member is TeamMemberDetails =>
  member?.membershipStatus === MembershipStatus.Active

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

    if (!isJoined(currentUser)) {
      throw new AppError(ErrorCode.Forbidden, 'Access denied to team')
    }
    if (!targetMember) {
      throw new AppError(ErrorCode.NotFound, 'Member not found')
    }

    c.set('currentUser', currentUser)
    c.set('targetMember', targetMember)
  } else {
    const currentUser = await teamRepo.findMember(teamId, currentUserId)
    if (!isJoined(currentUser)) {
      throw new AppError(ErrorCode.Forbidden, 'Access denied to team')
    }

    c.set('currentUser', currentUser)
  }

  const { membershipId } = c.get('currentUser')!
  c.set('teamPermissions', await resolveMemberPermissionList(membershipId))
}

export const requireTeamAccess = (
  permission: Permission,
  { allowSelf = false }: TeamAccessOptions = {}
) =>
  createMiddleware<AppContext>(async (c, next) => {
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

    const isSelf = allowSelf && memberId === currentUserId
    if (!isSelf && !c.get('teamPermissions')!.includes(permission)) {
      throw new AppError(ErrorCode.Forbidden)
    }

    return next()
  })
