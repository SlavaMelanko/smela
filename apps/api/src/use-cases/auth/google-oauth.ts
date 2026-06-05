import type { DeviceInfo } from '@/net/http/device'

import { authRepo, db, teamRepo, userRepo } from '@/data'
import { AuthProvider, UserStatus } from '@/types'

import { resolvePermissionList } from '../resolve-permissions'
import { createAuthTokens } from '../tokens'

interface GoogleOAuthInput {
  googleId: string
  email: string
  firstName: string
  lastName?: string
}

const findOrCreateGoogleUser = async (input: GoogleOAuthInput) => {
  const { googleId, email, firstName, lastName } = input

  const existingAuth = await authRepo.findByProvider(
    AuthProvider.Google,
    googleId
  )

  if (existingAuth) {
    const user = await userRepo.findById(existingAuth.userId)

    if (user) {
      return user
    }
  }

  return db.transaction(async tx => {
    // User may already exist via email (signed up with password before)
    let user = await userRepo.findByEmail(email, tx)

    if (!user) {
      user = await userRepo.create(
        { firstName, lastName, email, status: UserStatus.Active },
        tx
      )
    }

    await authRepo.create(
      { userId: user.id, provider: AuthProvider.Google, identifier: googleId },
      tx
    )

    // Activate if previously New — Google account implies email is verified
    if (user.status === UserStatus.New) {
      user = await userRepo.update(user.id, { status: UserStatus.Active }, tx)
    }

    return user
  })
}

export const logInOrSignUpWithGoogle = async (
  profile: GoogleOAuthInput,
  deviceInfo: DeviceInfo
) => {
  const user = await findOrCreateGoogleUser(profile)

  const [team, permissions] = await Promise.all([
    teamRepo.findUserTeam(user.id),
    resolvePermissionList(user.id)
  ])

  const [accessToken, refreshToken] = await createAuthTokens(
    user,
    deviceInfo,
    permissions
  )

  return {
    data: { user, team, permissions, accessToken },
    refreshToken
  }
}
