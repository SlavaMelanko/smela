import type { DeviceInfo } from '@/net/http/device'

import { authRepo, userRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import {
  comparePasswordHashes,
  getDummyPasswordHash
} from '@/security/password'

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
  const auth = user && (await authRepo.findById(user.id))

  // Unknown and social-only accounts get the same bcrypt work and the same
  // error as a wrong password, so neither timing nor response reveals them
  const passwordHash = auth?.passwordHash ?? (await getDummyPasswordHash())
  const isPasswordValid = await comparePasswordHashes(password, passwordHash)

  if (!user || !auth?.passwordHash || !isPasswordValid) {
    throw new AppError(ErrorCode.InvalidCredentials)
  }

  const [userTeams, permissions] = await Promise.all([
    resolveUserTeams(user.id),
    resolvePermissionList(user.id)
  ])

  const [accessToken, refreshToken] = await createAuthTokens(
    user,
    deviceInfo,
    permissions
  )

  return {
    data: { user, ...userTeams, permissions, accessToken },
    refreshToken
  }
}
