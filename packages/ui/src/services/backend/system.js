import { apiClient } from './apiClient'
import {
  ADMIN_EMAIL_SENDER_PROFILE_PATH,
  ADMIN_EMAIL_SENDER_PROFILES_PATH,
  buildPath
} from './paths'

export const systemApi = {
  listEmailSenderProfiles() {
    return apiClient.get(ADMIN_EMAIL_SENDER_PROFILES_PATH)
  },

  getEmailSenderProfile(profile) {
    const path = buildPath(ADMIN_EMAIL_SENDER_PROFILE_PATH, { profile })

    return apiClient.get(path)
  },

  updateEmailSenderProfile(profile, data) {
    const path = buildPath(ADMIN_EMAIL_SENDER_PROFILE_PATH, { profile })

    return apiClient.patch(path, data)
  }
}
