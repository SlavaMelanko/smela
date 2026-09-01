import { apiClient } from './apiClient'
import {
  ADMIN_EMAIL_SENDER_PROFILE_PATH,
  ADMIN_EMAIL_SENDER_PROFILES_PATH,
  ADMIN_SOCIAL_LINK_PATH,
  ADMIN_SOCIAL_LINKS_PATH,
  buildPath
} from './paths'

export const systemApi = {
  listEmailSenderProfiles() {
    return apiClient.get(ADMIN_EMAIL_SENDER_PROFILES_PATH)
  },

  listSocialLinks() {
    return apiClient.get(ADMIN_SOCIAL_LINKS_PATH)
  },

  getEmailSenderProfile(profile) {
    const path = buildPath(ADMIN_EMAIL_SENDER_PROFILE_PATH, { profile })

    return apiClient.get(path)
  },

  updateEmailSenderProfile(profile, data) {
    const path = buildPath(ADMIN_EMAIL_SENDER_PROFILE_PATH, { profile })

    return apiClient.patch(path, data)
  },

  getSocialLink(network) {
    const path = buildPath(ADMIN_SOCIAL_LINK_PATH, { network })

    return apiClient.get(path)
  }
}
