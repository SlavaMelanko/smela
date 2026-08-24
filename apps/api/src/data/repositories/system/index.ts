import { updateEmailSenderProfile } from './mutations'
import {
  findEmailSenderProfile,
  findEmailSenderProfiles,
  findSocialLinks
} from './queries'

export * from './types'

export const systemRepo = {
  findEmailSenderProfile,
  findEmailSenderProfiles,
  findSocialLinks,
  updateEmailSenderProfile
}
