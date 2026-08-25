import { updateEmailSenderProfile } from './mutations'
import {
  findEmailSenderProfile,
  listEmailSenderProfiles,
  listSocialLinks
} from './queries'

export * from './types'

export const systemRepo = {
  findEmailSenderProfile,
  listEmailSenderProfiles,
  listSocialLinks,
  updateEmailSenderProfile
}
