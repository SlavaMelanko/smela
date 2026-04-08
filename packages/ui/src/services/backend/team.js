import { withQuery } from '@ui/lib/url'

import apiClient from './apiClient'
import {
  ADMIN_TEAMS_PATH,
  buildPath,
  TEAM_MEMBER_CANCEL_INVITE_PATH,
  TEAM_MEMBER_PATH,
  TEAM_MEMBER_RESEND_INVITE_PATH,
  TEAM_MEMBERS_DEFAULT_PERMISSIONS_PATH,
  TEAM_MEMBERS_PATH,
  TEAMS_PATH
} from './paths'

export const teamApi = {
  // Admin-only operations
  listTeams(params) {
    return apiClient.get(withQuery(ADMIN_TEAMS_PATH, params))
  },

  createTeam(data) {
    return apiClient.post(ADMIN_TEAMS_PATH, data)
  },

  // Verified user + admin operations
  getTeam(teamId) {
    const path = buildPath(TEAMS_PATH, { teamId })

    return apiClient.get(path)
  },

  updateTeam(teamId, data) {
    const path = buildPath(TEAMS_PATH, { teamId })

    return apiClient.patch(path, data)
  },

  getMembers(teamId) {
    const path = buildPath(TEAM_MEMBERS_PATH, { teamId })

    return apiClient.get(path)
  },

  getMemberDefaultPermissions(teamId) {
    const path = buildPath(TEAM_MEMBERS_DEFAULT_PERMISSIONS_PATH, { teamId })

    return apiClient.get(path)
  },

  getMember(teamId, memberId) {
    const path = buildPath(TEAM_MEMBER_PATH, { teamId, memberId })

    return apiClient.get(path)
  },

  updateMember(teamId, memberId, data) {
    const path = buildPath(TEAM_MEMBER_PATH, { teamId, memberId })

    return apiClient.patch(path, data)
  },

  deleteMember(teamId, memberId) {
    const path = buildPath(TEAM_MEMBER_PATH, { teamId, memberId })

    return apiClient.delete(path)
  },

  inviteMember(teamId, data) {
    const path = buildPath(TEAM_MEMBERS_PATH, { teamId })

    return apiClient.post(path, data)
  },

  resendInvite(teamId, memberId) {
    const path = buildPath(TEAM_MEMBER_RESEND_INVITE_PATH, { teamId, memberId })

    return apiClient.post(path)
  },

  cancelInvite(teamId, memberId) {
    const path = buildPath(TEAM_MEMBER_CANCEL_INVITE_PATH, { teamId, memberId })

    return apiClient.post(path)
  }
}
