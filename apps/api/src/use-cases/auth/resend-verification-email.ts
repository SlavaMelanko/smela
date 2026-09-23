import type { UserPreferences } from '@/types'

import { db, tokenRepo, userRepo } from '@/data'
import { generateToken, TokenType } from '@/security/token'
import {
  buildVerificationUrl,
  emailService,
  VerificationEmailMessageBuilder
} from '@/services'
import { UserStatus } from '@/types'

const createEmailVerificationToken = async (userId: string) => {
  const { type, token, expiresAt } = generateToken(TokenType.EmailVerification)

  await db.transaction(async tx => {
    await tokenRepo.issue(userId, { userId, type, token, expiresAt }, tx)
  })

  return token
}

export interface ResendVerificationEmailInput {
  email: string
}

export const resendVerificationEmail = async (
  { email }: ResendVerificationEmailInput,
  preferences?: UserPreferences
) => {
  const user = await userRepo.findByEmail(email)

  // Always return success to prevent email enumeration
  // Only send email if user exists and is unverified
  if (user?.status === UserStatus.New) {
    const token = await createEmailVerificationToken(user.id)

    void emailService.send(
      new VerificationEmailMessageBuilder(
        user.email,
        {
          firstName: user.firstName,
          verificationUrl: buildVerificationUrl(token)
        },
        preferences
      )
    )
  }

  return { success: true }
}
