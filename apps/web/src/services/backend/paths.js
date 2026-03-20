// Auth endpoints
export const SIGNUP_PATH = '/api/v1/auth/signup'
export const LOGIN_PATH = '/api/v1/auth/login'
export const VERIFY_EMAIL_PATH = '/api/v1/auth/verify-email'
export const RESEND_VERIFICATION_EMAIL_PATH =
  '/api/v1/auth/resend-verification-email'
export const REQUEST_PASSWORD_RESET_PATH = '/api/v1/auth/request-password-reset'
export const RESET_PASSWORD_PATH = '/api/v1/auth/reset-password'
export const CHECK_INVITE_PATH = '/api/v1/auth/check-invite'
export const ACCEPT_INVITE_PATH = '/api/v1/auth/accept-invite'
export const REFRESH_TOKEN_PATH = '/api/v1/auth/refresh-token'
export const LOGOUT_PATH = '/api/v1/auth/logout'

// User endpoints
export const ME_PATH = '/api/v1/user/me'
export const UPDATE_PASSWORD_PATH = '/api/v1/user/me/password'

// Admin endpoints
export const ADMIN_USERS_PATH = '/api/v1/admin/users'
export const ADMIN_USER_PATH = `${ADMIN_USERS_PATH}/:userId`
export const ADMIN_TEAMS_PATH = '/api/v1/admin/teams'

// Verified user/admin team operations
export const TEAMS_PATH = '/api/v1/user/verified/teams/:teamId'
export const TEAM_MEMBERS_PATH = `${TEAMS_PATH}/members`
export const TEAM_MEMBERS_DEFAULT_PERMISSIONS_PATH = `${TEAM_MEMBERS_PATH}/default-permissions`
export const TEAM_MEMBER_PATH = `${TEAM_MEMBERS_PATH}/:memberId`
export const TEAM_MEMBER_RESEND_INVITE_PATH = `${TEAM_MEMBER_PATH}/resend-invite`
export const TEAM_MEMBER_CANCEL_INVITE_PATH = `${TEAM_MEMBER_PATH}/cancel-invite`

// Owner endpoints
export const OWNER_ADMINS_PATH = '/api/v1/owner/admins'
export const OWNER_ADMINS_DEFAULT_PERMISSIONS_PATH = `${OWNER_ADMINS_PATH}/default-permissions`
export const OWNER_ADMIN_PATH = `${OWNER_ADMINS_PATH}/:adminId`
export const OWNER_ADMIN_PERMISSIONS_PATH = `${OWNER_ADMIN_PATH}/permissions`
export const OWNER_ADMINS_RESEND_INVITE_PATH = `${OWNER_ADMIN_PATH}/resend-invite`
export const OWNER_ADMINS_CANCEL_INVITE_PATH = `${OWNER_ADMIN_PATH}/cancel-invite`

export const buildPath = (template, params) => {
  return Object.entries(params).reduce(
    (url, [key, value]) => url.replace(`:${key}`, value),
    template
  )
}
