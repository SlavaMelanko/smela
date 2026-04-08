import apiClient from './apiClient'
import {
  ACCEPT_INVITE_PATH,
  CHECK_INVITE_PATH,
  LOGIN_PATH,
  LOGOUT_PATH,
  REQUEST_PASSWORD_RESET_PATH,
  RESEND_VERIFICATION_EMAIL_PATH,
  RESET_PASSWORD_PATH,
  SIGNUP_PATH,
  VERIFY_EMAIL_PATH
} from './paths'

export const authApi = {
  signUp(data) {
    return apiClient.post(SIGNUP_PATH, data)
  },

  logIn(data) {
    return apiClient.post(LOGIN_PATH, data)
  },

  verifyEmail(data) {
    return apiClient.post(VERIFY_EMAIL_PATH, data)
  },

  resendVerificationEmail(data) {
    return apiClient.post(RESEND_VERIFICATION_EMAIL_PATH, data)
  },

  requestPasswordReset(data) {
    return apiClient.post(REQUEST_PASSWORD_RESET_PATH, data)
  },

  resetPassword(data) {
    return apiClient.post(RESET_PASSWORD_PATH, data)
  },

  checkInvite(token) {
    return apiClient.get(
      `${CHECK_INVITE_PATH}?token=${encodeURIComponent(token)}`
    )
  },

  acceptInvite(data) {
    return apiClient.post(ACCEPT_INVITE_PATH, data)
  },

  logOut() {
    return apiClient.post(LOGOUT_PATH)
  }
}
