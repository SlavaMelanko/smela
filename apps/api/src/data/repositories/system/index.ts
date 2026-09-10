import {
  createSocialLink,
  deleteSocialLink,
  updateEmailSenderProfile,
  updateSocialLink
} from './mutations'
import {
  findEmailSenderProfile,
  findSocialLink,
  findSocialLinkByName,
  listEmailSenderProfiles,
  listSocialLinks
} from './queries'

export * from './types'

export const systemRepo = {
  createSocialLink,
  deleteSocialLink,
  findEmailSenderProfile,
  findSocialLink,
  findSocialLinkByName,
  listEmailSenderProfiles,
  listSocialLinks,
  updateEmailSenderProfile,
  updateSocialLink
}
