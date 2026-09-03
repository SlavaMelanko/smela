import type { EmailSenderType } from '@/services/email'

import { systemRepo } from '@/data'
import { AppError, ErrorCode } from '@/errors'
import { emailService } from '@/services'

export const getEmailSenderProfiles = async () => {
  const senderProfiles = await systemRepo.listEmailSenderProfiles()

  return { senderProfiles }
}

export const getSocialLinks = async () => {
  const socialLinks = await systemRepo.listSocialLinks()

  return { socialLinks }
}

export const getSocialLink = async (id: string) => {
  const socialLink = await systemRepo.findSocialLink(id)

  if (!socialLink) {
    throw new AppError(ErrorCode.NotFound, 'Social link not found')
  }

  return { socialLink }
}

export interface UpdateSocialLinkInput {
  name?: string
  url?: string
  svg?: string
}

export const updateSocialLink = async (
  id: string,
  updates: UpdateSocialLinkInput
) => {
  await getSocialLink(id)

  const socialLink = await systemRepo.updateSocialLink(id, updates)

  return { socialLink }
}

export const deleteSocialLink = async (id: string) => {
  await getSocialLink(id)

  await systemRepo.deleteSocialLink(id)

  return { success: true }
}

export const getEmailSenderProfile = async (profile: EmailSenderType) => {
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
  profile: EmailSenderType,
  updates: UpdateEmailSenderProfileInput
) => {
  await getEmailSenderProfile(profile)

  const senderProfile = await systemRepo.updateEmailSenderProfile(
    profile,
    updates
  )

  emailService.invalidateSenderProfiles()

  return { senderProfile }
}
