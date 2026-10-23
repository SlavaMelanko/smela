import { and, eq, inArray } from 'drizzle-orm'

import type { PermissionsInput } from '@/types'

import { AppError, ErrorCode } from '@/errors'
import { MembershipStatus } from '@/types'

import type { Database } from '../../clients'
import type {
  CreateMembershipInput,
  CreateTeamInput,
  Membership,
  Team,
  UpdateTeamInput
} from './types'

import { db } from '../../clients'
import {
  membershipPermissionsTable,
  membershipsTable,
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

export const createMembership = async (
  input: CreateMembershipInput,
  tx?: Database
): Promise<Membership> => {
  const executor = tx || db

  const [membership] = await executor
    .insert(membershipsTable)
    .values(input)
    .returning()

  if (!membership) {
    throw new AppError(ErrorCode.InternalError, 'Failed to add user to team')
  }

  return membership
}

export interface UpdateMembershipInput {
  position?: string | null
}

export const updateMembership = async (
  userId: string,
  teamId: string,
  updates: UpdateMembershipInput,
  tx?: Database
): Promise<Membership> => {
  const executor = tx || db

  const [membership] = await executor
    .update(membershipsTable)
    .set(updates)
    .where(
      and(
        eq(membershipsTable.userId, userId),
        eq(membershipsTable.teamId, teamId)
      )
    )
    .returning()

  if (!membership) {
    throw new AppError(ErrorCode.InternalError, 'Failed to update membership')
  }

  return membership
}

// Returns undefined when the user is not an active member of the team
export const markMembershipLastActive = async (
  userId: string,
  teamId: string,
  tx?: Database
): Promise<Membership | undefined> => {
  const executor = tx || db

  const [membership] = await executor
    .update(membershipsTable)
    .set({ lastActiveAt: new Date() })
    .where(
      and(
        eq(membershipsTable.userId, userId),
        eq(membershipsTable.teamId, teamId),
        eq(membershipsTable.status, MembershipStatus.Active)
      )
    )
    .returning()

  return membership
}

// Accepting makes the team active. Returns undefined when there is no pending membership
export const activateMembership = async (
  userId: string,
  teamId: string,
  tx?: Database
): Promise<Membership | undefined> => {
  const executor = tx || db

  const now = new Date()

  const [membership] = await executor
    .update(membershipsTable)
    .set({ status: MembershipStatus.Active, joinedAt: now, lastActiveAt: now })
    .where(
      and(
        eq(membershipsTable.userId, userId),
        eq(membershipsTable.teamId, teamId),
        eq(membershipsTable.status, MembershipStatus.Pending)
      )
    )
    .returning()

  return membership
}

// Returns undefined when there is no pending membership
export const deletePendingMembership = async (
  userId: string,
  teamId: string,
  tx?: Database
): Promise<Membership | undefined> => {
  const executor = tx || db

  const [membership] = await executor
    .delete(membershipsTable)
    .where(
      and(
        eq(membershipsTable.userId, userId),
        eq(membershipsTable.teamId, teamId),
        eq(membershipsTable.status, MembershipStatus.Pending)
      )
    )
    .returning()

  return membership
}

export const deleteMembership = async (
  userId: string,
  teamId: string,
  tx?: Database
): Promise<void> => {
  const executor = tx || db

  await executor
    .delete(membershipsTable)
    .where(
      and(
        eq(membershipsTable.userId, userId),
        eq(membershipsTable.teamId, teamId)
      )
    )
}

export const setMembershipPermissions = async (
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
      .insert(membershipPermissionsTable)
      .values(grantIds.map(permissionId => ({ membershipId, permissionId })))
      .onConflictDoNothing()
  }

  const revoke = async () => {
    if (revokeIds.length === 0) {
      return
    }

    await executor
      .delete(membershipPermissionsTable)
      .where(
        and(
          eq(membershipPermissionsTable.membershipId, membershipId),
          inArray(membershipPermissionsTable.permissionId, revokeIds)
        )
      )
  }

  await Promise.all([grant(), revoke()])
}
