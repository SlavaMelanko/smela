import { updateEmailSenderProfile } from './mutations'
import {
  findEmailSenderProfile,
  findSocialLink,
  listEmailSenderProfiles,
  listSocialLinks
} from './queries'

export * from './types'

export const systemRepo = {
  findEmailSenderProfile,
  findSocialLink,
  listEmailSenderProfiles,
  listSocialLinks,
  updateEmailSenderProfile
}
