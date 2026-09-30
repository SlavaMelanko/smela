import { describe, expect, it } from 'bun:test'

import env from '@/env'
import { Role } from '@/types'

import {
  buildInviteUrl,
  buildResetPasswordUrl,
  buildVerificationUrl
} from '../email-urls'

describe('email URLs', () => {
  const token = 'test-token'

  it('builds the verification URL on the user frontend', () => {
    expect(buildVerificationUrl(token)).toBe(
      `${env.FE_USER_URL}/verify-email?token=${token}`
    )
  })

  it('builds the reset password URL on the user frontend for users', () => {
    expect(buildResetPasswordUrl(Role.User, token)).toBe(
      `${env.FE_USER_URL}/reset-password?token=${token}`
    )
  })

  it('builds the reset password URL on the admin frontend for admins', () => {
    expect(buildResetPasswordUrl(Role.Admin, token)).toBe(
      `${env.FE_ADMIN_URL}/reset-password?token=${token}`
    )
  })

  it('builds the invite URL on the admin frontend for admins', () => {
    expect(buildInviteUrl(Role.Admin, token)).toBe(
      `${env.FE_ADMIN_URL}/accept-invite?token=${token}`
    )
  })
})
