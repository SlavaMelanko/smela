import { updateEmailSenderProfile } from './mutations'
import { findEmailSenderProfile, findEmailSenderProfiles } from './queries'

export * from './types'

export const systemRepo = {
  findEmailSenderProfile,
  findEmailSenderProfiles,
  updateEmailSenderProfile
}
