import type { DeviceInfo } from '@/net/http/device'
import type { UserPreferences } from '@/types'

import { authRepo, db, rbacRepo, userRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { hashPassword } from '@/security/password'
import { TokenType } from '@/security/token'
import {
  buildVerificationUrl,
  emailService,
  VerificationEmailMessageBuilder
} from '@/services/email'
import { AuthProvider, getUserDefaultPermissions, UserStatus } from '@/types'

import { resolveNickname } from '../resolve-nickname'
import { resolvePermissionList } from '../resolve-permissions'
import { createAuthTokens, issueOneTimeToken } from '../tokens'

const createNewUser = async ({
  nickname,
  firstName,
  lastName,
  email,
  password
}: SignupInput) => {
  const hashedPassword = await hashPassword(password)

  return db.transaction(async tx => {
    const newUser = await userRepo.create(
      {
        nickname: resolveNickname(email, nickname, firstName),
        firstName,
        lastName,
        email,
        status: UserStatus.New
      },
      tx
    )

    await authRepo.create(
      {
        userId: newUser.id,
        provider: AuthProvider.Local,
        identifier: email,
        passwordHash: hashedPassword
      },
      tx
    )

    const verificationToken = await issueOneTimeToken(
      newUser.id,
      TokenType.EmailVerification,
      tx
    )

    await rbacRepo.setUserPermissions(
      newUser.id,
      getUserDefaultPermissions(),
      tx
    )

    return { newUser, verificationToken }
  })
}

export interface SignupInput {
  nickname?: string
  firstName?: string | null
  lastName?: string | null
  email: string
  password: string
}

export const signUpWithEmail = async (
  { nickname, firstName, lastName, email, password }: SignupInput,
  deviceInfo: DeviceInfo,
  preferences?: UserPreferences
) => {
  // Check if user exists (outside transaction for fast fail)
  const existingUser = await userRepo.findByEmail(email)

  if (existingUser) {
    throw new AppError(ErrorCode.EmailAlreadyInUse)
  }

  // Create new user, verification token, etc. in a single transaction
  const { newUser, verificationToken } = await createNewUser({
    nickname,
    firstName,
    lastName,
    email,
    password
  })

  void emailService.send(
    new VerificationEmailMessageBuilder(
      newUser.email,
      {
        nickname: newUser.nickname,
        verificationUrl: buildVerificationUrl(verificationToken)
      },
      preferences
    )
  )

  const permissions = await resolvePermissionList(newUser.id)

  const [accessToken, refreshToken] = await createAuthTokens(
    newUser,
    deviceInfo,
    permissions
  )

  return {
    data: { user: newUser, permissions, accessToken },
    refreshToken
  }
}
