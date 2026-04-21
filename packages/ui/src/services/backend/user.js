import { apiClient } from './apiClient'
import { ME_PATH, UPDATE_PASSWORD_PATH } from './paths'

export const userApi = {
  getCurrentUser() {
    return apiClient.get(ME_PATH)
  },

  updateUser(data) {
    return apiClient.patch(ME_PATH, data)
  },

  updatePassword(data) {
    return apiClient.patch(UPDATE_PASSWORD_PATH, data)
  }
}
