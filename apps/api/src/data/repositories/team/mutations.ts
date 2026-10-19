import { and, eq, inArray } from 'drizzle-orm'

import type { PermissionsInput } from '@/types'

import { AppError, ErrorCode } from '@/errors'

import type { Database } from '../../clients'
import type {
  CreateTeamInput,
  CreateTeamMemberInput,
  Team,
  TeamMember,
  UpdateTeamInput
} from './types'

import { db } from '../../clients'
import {
  teamMemberPermissionsTable,
  teamMembersTable,
  teamsTable
} from '../../schema'
import { rbacRepo, splitPermissions } from '../rbac'

export const createTeam = async (
  input: CreateTeamInput,
  tx?: Database
): Promise<Team> => {
  const executor = tx || db

  const [team] = await executor.insert(teamsTable).values(input).returning()

  if (!team) {
    throw new AppError(ErrorCode.InternalError, 'Failed to create team')
  }

  return team
}

export const updateTeam = async (
  teamId: string,
  updates: UpdateTeamInput,
  tx?: Database
): Promise<Team> => {
  const executor = tx || db

  const [team] = await executor
    .update(teamsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(teamsTable.id, teamId))
    .returning()

  if (!team) {
    throw new AppError(ErrorCode.InternalError, 'Failed to update team')
  }

  return team
}

export const createTeamMember = async (
  input: CreateTeamMemberInput,
  tx?: Database
): Promise<TeamMember> => {
  const executor = tx || db

  const [membership] = await executor
    .insert(teamMembersTable)
    .values(input)
    .returning()

  if (!membership) {
    throw new AppError(ErrorCode.InternalError, 'Failed to add user to team')
  }

  return membership
}

export interface UpdateTeamMemberInput {
  position?: string | null
}

export const updateTeamMember = async (
  userId: string,
  teamId: string,
  updates: UpdateTeamMemberInput,
  tx?: Database
): Promise<TeamMember> => {
  const executor = tx || db

  const [membership] = await executor
    .update(teamMembersTable)
    .set(updates)
    .where(
      and(
        eq(teamMembersTable.userId, userId),
        eq(teamMembersTable.teamId, teamId)
      )
    )
    .returning()

  if (!membership) {
    throw new AppError(ErrorCode.InternalError, 'Failed to update membership')
  }

  return membership
}

// Returns undefined when the user is not a member of the team
export const markTeamMemberActive = async (
  userId: string,
  teamId: string,
  tx?: Database
): Promise<TeamMember | undefined> => {
  const executor = tx || db

  const [membership] = await executor
    .update(teamMembersTable)
    .set({ lastActiveAt: new Date() })
    .where(
      and(
        eq(teamMembersTable.userId, userId),
        eq(teamMembersTable.teamId, teamId)
      )
    )
    .returning()

  return membership
}

export const deleteTeamMember = async (
  userId: string,
  teamId: string,
  tx?: Database
): Promise<void> => {
  const executor = tx || db

  await executor
    .delete(teamMembersTable)
    .where(
      and(
        eq(teamMembersTable.userId, userId),
        eq(teamMembersTable.teamId, teamId)
      )
    )
}

export const setTeamMemberPermissions = async (
  membershipId: string,
  permissions: PermissionsInput,
  tx?: Database
): Promise<void> => {
  const executor = tx || db
  const allPermissions = await rbacRepo.findAllPermissions(tx)
  const { grantIds, revokeIds } = splitPermissions(permissions, allPermissions)

  const grant = async () => {
    if (grantIds.length === 0) {
      return
    }

    await executor
      .insert(teamMemberPermissionsTable)
      .values(
        grantIds.map(permissionId => ({ memberId: membershipId, permissionId }))
      )
      .onConflictDoNothing()
  }

  const revoke = async () => {
    if (revokeIds.length === 0) {
      return
    }

    await executor
      .delete(teamMemberPermissionsTable)
      .where(
        and(
          eq(teamMemberPermissionsTable.memberId, membershipId),
          inArray(teamMemberPermissionsTable.permissionId, revokeIds)
        )
      )
  }

  await Promise.all([grant(), revoke()])
}
