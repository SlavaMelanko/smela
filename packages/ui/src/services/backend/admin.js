import { withQuery } from '@ui/lib/url'

import { apiClient } from './apiClient'
import { ADMIN_USER_PATH, ADMIN_USERS_PATH, buildPath } from './paths'

export const adminApi = {
  getUsers(params) {
    return apiClient.get(withQuery(ADMIN_USERS_PATH, params))
  },

  getUserById(id) {
    const path = buildPath(ADMIN_USER_PATH, { userId: id })

    return apiClient.get(path)
  },

  updateUser(id, data) {
    const path = buildPath(ADMIN_USER_PATH, { userId: id })

    return apiClient.patch(path, data)
  }
}
