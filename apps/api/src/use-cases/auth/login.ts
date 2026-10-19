import type { DeviceInfo } from '@/net/http/device'

import { authRepo, userRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { comparePasswordHashes } from '@/security/password'

import { resolvePermissionList } from '../resolve-permissions'
import { resolveUserTeams } from '../resolve-team'
import { createAuthTokens } from '../tokens'

export interface LoginInput {
  email: string
  password: string
}

export const logInWithEmail = async (
  { email, password }: LoginInput,
  deviceInfo: DeviceInfo
) => {
  const user = await userRepo.findByEmail(email)

  if (!user) {
    throw new AppError(ErrorCode.InvalidCredentials)
  }

  const auth = await authRepo.findById(user.id)

  if (!auth) {
    throw new AppError(ErrorCode.InvalidCredentials)
  }

  if (!auth.passwordHash) {
    throw new AppError(ErrorCode.SocialAuthOnly)
  }

  const isPasswordValid = await comparePasswordHashes(
    password,
    auth.passwordHash
  )

  if (!isPasswordValid) {
    throw new AppError(ErrorCode.InvalidCredentials)
  }

  const [{ team, teams }, permissions] = await Promise.all([
    resolveUserTeams(user.id),
    resolvePermissionList(user.id)
  ])

  const [accessToken, refreshToken] = await createAuthTokens(
    user,
    deviceInfo,
    permissions
  )

  return {
    data: { user, team, teams, permissions, accessToken },
    refreshToken
  }
}
