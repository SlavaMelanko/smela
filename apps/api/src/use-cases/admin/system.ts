import type { EmailSenderProfile } from '@/types'

import { systemRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { emailAgent } from '@/services'

export const getEmailSenderProfiles = async () => {
  const senderProfiles = await systemRepo.findEmailSenderProfiles()

  return { senderProfiles }
}

export const getSocialLinks = async () => {
  const socialLinks = await systemRepo.findSocialLinks()

  return { socialLinks }
}

export const getEmailSenderProfile = async (profile: EmailSenderProfile) => {
  const senderProfile = await systemRepo.findEmailSenderProfile(profile)

  if (!senderProfile) {
    throw new AppError(ErrorCode.NotFound, 'Email sender profile not found')
  }

  return { senderProfile }
}

export interface UpdateEmailSenderProfileInput {
  email?: string
  name?: string
  description?: string | null
}

export const updateEmailSenderProfile = async (
  profile: EmailSenderProfile,
  updates: UpdateEmailSenderProfileInput
) => {
  await getEmailSenderProfile(profile)

  const senderProfile = await systemRepo.updateEmailSenderProfile(
    profile,
    updates
  )

  emailAgent.invalidateSenderProfiles()

  return { senderProfile }
}
