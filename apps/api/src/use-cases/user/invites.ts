import type { TeamMemberDetails, TeamWithMemberCount } from '@/data'
import type { PermissionsInput } from '@/types'

import { authRepo, db, rbacRepo, teamRepo, tokenRepo, userRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { generatePasswordHash } from '@/security/password'
import { generateToken, TokenType } from '@/security/token'
import {
  buildInviteUrl,
  emailService,
  UserInvitationEmailMessageBuilder
} from '@/services/email'
import { AuthProvider, Role, UserStatus } from '@/types'

export interface InviteMemberInput {
  firstName: string
  lastName?: string
  email: string
  position?: string
  permissions: PermissionsInput
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

  if (existingUser) {
    throw new AppError(ErrorCode.EmailAlreadyInUse)
  }

  const { member: newMember, token } = await db.transaction(async tx => {
    const newUser = await userRepo.create(
      {
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        status: UserStatus.Pending
      },
      tx
    )

    // Use random password and user sets real password when accepting invitation
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

    await teamRepo.createMember(
      {
        userId: newUser.id,
        teamId: team.id,
        position: member.position,
        invitedBy: inviterId
      },
      tx
    )

    await rbacRepo.setUserPermissions(newUser.id, member.permissions, tx)

    const { type, token, expiresAt } = generateToken(TokenType.UserInvite)

    await tokenRepo.issue(
      newUser.id,
      {
        userId: newUser.id,
        type,
        token,
        expiresAt
      },
      tx
    )

    return {
      member: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        status: newUser.status,
        position: member.position ?? null,
        invitedBy: inviterId,
        joinedAt: newUser.createdAt
      },
      token
    }
  })

  void emailService.send(
    new UserInvitationEmailMessageBuilder(newMember.email, {
      firstName: newMember.firstName,
      inviteUrl: buildInviteUrl(Role.User, token),
      inviterName: inviter.firstName,
      teamName: team.name
    })
  )

  return { member: newMember }
}

export const resendMemberInvite = async (
  team: TeamWithMemberCount,
  member: TeamMemberDetails,
  inviterId: string
) => {
  const inviter = await userRepo.findById(inviterId)

  if (!inviter) {
    throw new AppError(ErrorCode.NotFound, 'Inviter not found')
  }

  if (member.status !== UserStatus.Pending) {
    throw new AppError(
      ErrorCode.BadRequest,
      'Member has already accepted invitation'
    )
  }

  const token = await db.transaction(async tx => {
    const { type, token, expiresAt } = generateToken(TokenType.UserInvite)
    await tokenRepo.issue(
      member.id,
      { userId: member.id, type, token, expiresAt },
      tx
    )

    return token
  })

  void emailService.send(
    new UserInvitationEmailMessageBuilder(member.email, {
      firstName: member.firstName,
      inviteUrl: buildInviteUrl(Role.User, token),
      inviterName: inviter.firstName,
      teamName: team.name
    })
  )

  return { success: true }
}

export const cancelMemberInvite = async (member: TeamMemberDetails) => {
  if (member.status !== UserStatus.Pending) {
    throw new AppError(
      ErrorCode.BadRequest,
      'Member has already accepted invitation'
    )
  }

  await db.transaction(async tx => {
    await tokenRepo.deprecate(member.id, TokenType.UserInvite, tx)
    await userRepo.update(member.id, { status: UserStatus.Archived }, tx)
  })

  return { success: true }
}
