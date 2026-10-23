import type {
  Database,
  TeamMemberDetails,
  TeamWithMemberCount,
  User
} from '@/data'
import type { PermissionsInput } from '@/types'

import { authRepo, db, rbacRepo, teamRepo, tokenRepo, userRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { generatePasswordHash } from '@/security/password'
import { InviteKind } from '@/security/token'
import {
  buildAppUrl,
  buildInviteUrl,
  emailService,
  UserInviteEmailMessageBuilder
} from '@/services/email'
import {
  AuthProvider,
  getUserDefaultPermissions,
  isNewOrActive,
  isUser,
  MembershipStatus,
  Role,
  UserStatus
} from '@/types'

import { resolveNickname } from '../resolve-nickname'
import { issueInviteToken } from '../tokens'

export interface InviteMemberInput {
  email: string
  position?: string
  permissions: PermissionsInput
}

interface Invitee {
  email: string
  nickname: string
}

// A pending account never set a password, so it still needs the token link.
// Any other account signs in and accepts the invite in the app
const needsInviteToken = (user: User) => user.status === UserStatus.Pending

const canBeInvited = (user: User) =>
  isUser(user.role) &&
  (user.status === UserStatus.Pending || isNewOrActive(user.status))

const issueTeamInviteToken = async (
  userId: string,
  teamId: string,
  tx?: Database
) => issueInviteToken(userId, { kind: InviteKind.Member, teamId }, tx)

const sendInviteEmail = (
  invitee: Invitee,
  inviter: User,
  team: TeamWithMemberCount,
  token?: string
) =>
  void emailService.send(
    new UserInviteEmailMessageBuilder(invitee.email, {
      // A token means the account hasn't been accepted yet, so its nickname is
      // still the email-prefix placeholder. Let the greeting fall back instead
      nickname: token ? undefined : invitee.nickname,
      inviteUrl: token
        ? buildInviteUrl(Role.User, token)
        : buildAppUrl(Role.User),
      hasAccount: !token,
      inviterName: inviter.nickname,
      teamName: team.name
    })
  )

const addPendingMember = async (
  userId: string,
  team: TeamWithMemberCount,
  member: InviteMemberInput,
  inviterId: string,
  tx: Database
) => {
  const membership = await teamRepo.createMembership(
    {
      userId,
      teamId: team.id,
      position: member.position,
      status: MembershipStatus.Pending,
      invitedBy: inviterId
    },
    tx
  )

  await teamRepo.setMembershipPermissions(membership.id, member.permissions, tx)
}

const inviteNewUser = async (
  team: TeamWithMemberCount,
  member: InviteMemberInput,
  inviterId: string
) =>
  db.transaction(async tx => {
    const newUser = await userRepo.create(
      {
        // Placeholder until the invitee picks a nickname when accepting
        nickname: resolveNickname(member.email),
        email: member.email,
        status: UserStatus.Pending
      },
      tx
    )

    // Use random password and user sets real password when accepting invite
    const passwordHash = await generatePasswordHash()

    await authRepo.create(
      {
        userId: newUser.id,
        provider: AuthProvider.Local,
        identifier: member.email,
        passwordHash
      },
      tx
    )

    await addPendingMember(newUser.id, team, member, inviterId, tx)

    await rbacRepo.setUserPermissions(
      newUser.id,
      getUserDefaultPermissions(),
      tx
    )

    const token = await issueTeamInviteToken(newUser.id, team.id, tx)

    return { user: newUser, token }
  })

// The account keeps its own name and user-level permissions
const inviteExistingUser = async (
  user: User,
  team: TeamWithMemberCount,
  member: InviteMemberInput,
  inviterId: string
) => {
  if (!canBeInvited(user)) {
    throw new AppError(ErrorCode.EmailAlreadyInUse)
  }

  if (await teamRepo.findMember(team.id, user.id)) {
    throw new AppError(ErrorCode.Conflict, 'User is already a team member')
  }

  return db.transaction(async tx => {
    await addPendingMember(user.id, team, member, inviterId, tx)

    const token = needsInviteToken(user)
      ? await issueTeamInviteToken(user.id, team.id, tx)
      : undefined

    return { user, token }
  })
}

export const inviteMember = async (
  team: TeamWithMemberCount,
  member: InviteMemberInput,
  inviterId: string
) => {
  const [inviter, existingUser] = await Promise.all([
    userRepo.findById(inviterId),
    userRepo.findByEmail(member.email)
  ])

  if (!inviter) {
    throw new AppError(ErrorCode.NotFound, 'Inviter not found')
  }

  const { user, token } = existingUser
    ? await inviteExistingUser(existingUser, team, member, inviterId)
    : await inviteNewUser(team, member, inviterId)

  sendInviteEmail(user, inviter, team, token)

  return { member: await teamRepo.findMember(team.id, user.id) }
}

export const resendMemberInvite = async (
  team: TeamWithMemberCount,
  member: TeamMemberDetails,
  inviterId: string
) => {
  if (member.status !== MembershipStatus.Pending) {
    throw new AppError(
      ErrorCode.BadRequest,
      'Member has already accepted invitation'
    )
  }

  const [inviter, user] = await Promise.all([
    userRepo.findById(inviterId),
    userRepo.findById(member.id)
  ])

  if (!inviter) {
    throw new AppError(ErrorCode.NotFound, 'Inviter not found')
  }

  if (!user) {
    throw new AppError(ErrorCode.NotFound, 'Member not found')
  }

  const token = needsInviteToken(user)
    ? await issueTeamInviteToken(user.id, team.id)
    : undefined

  sendInviteEmail(user, inviter, team, token)

  return { success: true }
}

// Removes only the pending membership. The account and other memberships stay intact
export const cancelMemberInvite = async (
  teamId: string,
  member: TeamMemberDetails
) => {
  if (member.status !== MembershipStatus.Pending) {
    throw new AppError(
      ErrorCode.BadRequest,
      'Member has already accepted invitation'
    )
  }

  await db.transaction(async tx => {
    await tokenRepo.deprecateTeamInvites(member.id, teamId, tx)
    await teamRepo.deleteMembership(member.id, teamId, tx)
  })

  return { success: true }
}
