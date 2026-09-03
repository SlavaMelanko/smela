import {
  deleteSocialLink,
  updateEmailSenderProfile,
  updateSocialLink
} from './mutations'
import {
  findEmailSenderProfile,
  findSocialLink,
  listEmailSenderProfiles,
  listSocialLinks
} from './queries'

export * from './types'

export const systemRepo = {
  deleteSocialLink,
  findEmailSenderProfile,
  findSocialLink,
  listEmailSenderProfiles,
  listSocialLinks,
  updateEmailSenderProfile,
  updateSocialLink
}
