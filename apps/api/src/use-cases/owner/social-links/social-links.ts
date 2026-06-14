import type {
  CreateSocialLinkInput,
  SocialLink,
  UpdateSocialLinkInput
} from '@/data'

import { appRepo } from '@/data'
import { emailAgent } from '@/services'

// Re-pull links from the DB and push them into the email config cache
// so footers reflect owner edits without a restart
const syncEmailSocialLinks = async (): Promise<void> => {
  const links = await appRepo.findSocialLinks()

  emailAgent.setConfig({
    socialLinks: links.map(({ name, url, icon }) => ({ name, url, icon }))
  })
}

export const getSocialLinks = async (): Promise<SocialLink[]> =>
  appRepo.findSocialLinks()

export const createSocialLink = async (
  input: CreateSocialLinkInput
): Promise<SocialLink> => {
  const link = await appRepo.createSocialLink(input)

  await syncEmailSocialLinks()

  return link
}

export const updateSocialLink = async (
  id: string,
  updates: UpdateSocialLinkInput
): Promise<SocialLink> => {
  const link = await appRepo.updateSocialLink(id, updates)

  await syncEmailSocialLinks()

  return link
}

export const deleteSocialLink = async (id: string): Promise<void> => {
  await appRepo.deleteSocialLink(id)

  await syncEmailSocialLinks()
}
