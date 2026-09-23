import type { Role } from '@/types'

import env from '@/env'
import { isAdmin } from '@/types'

const getFeBaseUrl = (role: Role) =>
  isAdmin(role) ? env.FE_ADMIN_URL : env.FE_USER_URL

export const buildVerificationUrl = (token: string) =>
  `${env.FE_USER_URL}/verify-email?token=${token}`

export const buildResetPasswordUrl = (role: Role, token: string) =>
  `${getFeBaseUrl(role)}/reset-password?token=${token}`

export const buildInviteUrl = (role: Role, token: string) =>
  `${getFeBaseUrl(role)}/accept-invite?token=${token}`
