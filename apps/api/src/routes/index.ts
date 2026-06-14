import { adminTeamsRoute, adminUsersRoute } from './admin'
import {
  acceptInviteRoute,
  checkInviteRoute,
  googleOAuthRoute,
  loginRoute,
  logoutRoute,
  refreshTokenRoute,
  requestPasswordResetRoute,
  resendVerificationEmailRoute,
  resetPasswordRoute,
  signupRoute,
  verifyEmailRoute
} from './auth'
import { ownerAdminsRoute, ownerSocialLinksRoute } from './owner'
import { meRoute, teamsRoute } from './user'

export const authPublicRoutes = [
  acceptInviteRoute,
  checkInviteRoute,
  googleOAuthRoute,
  loginRoute,
  logoutRoute,
  refreshTokenRoute,
  signupRoute,
  verifyEmailRoute,
  resendVerificationEmailRoute,
  requestPasswordResetRoute,
  resetPasswordRoute
]

export const userRoutesAllowNew = [meRoute]

export const userRoutesVerifiedOnly = [teamsRoute]

export const adminRoutes = [adminTeamsRoute, adminUsersRoute]

export const ownerRoutes = [ownerAdminsRoute, ownerSocialLinksRoute]
