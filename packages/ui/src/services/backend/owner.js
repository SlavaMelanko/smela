import { withQuery } from '@ui/lib/url'

import apiClient from './apiClient'
import {
  buildPath,
  OWNER_ADMIN_PATH,
  OWNER_ADMIN_PERMISSIONS_PATH,
  OWNER_ADMINS_CANCEL_INVITE_PATH,
  OWNER_ADMINS_DEFAULT_PERMISSIONS_PATH,
  OWNER_ADMINS_PATH,
  OWNER_ADMINS_RESEND_INVITE_PATH
} from './paths'

export const ownerApi = {
  getAdmins(params) {
    return apiClient.get(withQuery(OWNER_ADMINS_PATH, params))
  },

  getAdmin(adminId) {
    const path = buildPath(OWNER_ADMIN_PATH, { adminId })

    return apiClient.get(path)
  },

  updateAdmin(adminId, data) {
    const path = buildPath(OWNER_ADMIN_PATH, { adminId })

    return apiClient.patch(path, data)
  },

  getAdminDefaultPermissions() {
    return apiClient.get(OWNER_ADMINS_DEFAULT_PERMISSIONS_PATH)
  },

  getAdminPermissions(adminId) {
    const path = buildPath(OWNER_ADMIN_PERMISSIONS_PATH, { adminId })

    return apiClient.get(path)
  },

  updateAdminPermissions(adminId, data) {
    const path = buildPath(OWNER_ADMIN_PERMISSIONS_PATH, { adminId })

    return apiClient.patch(path, data)
  },

  createAdmin(data) {
    return apiClient.post(OWNER_ADMINS_PATH, data)
  },

  resendAdminInvite(adminId) {
    const path = buildPath(OWNER_ADMINS_RESEND_INVITE_PATH, { adminId })

    return apiClient.post(path)
  },

  cancelAdminInvite(adminId) {
    const path = buildPath(OWNER_ADMINS_CANCEL_INVITE_PATH, { adminId })

    return apiClient.post(path)
  }
}
