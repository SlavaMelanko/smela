import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { adminEmailSenderProfilesRoute } from './email-sender-profiles'
import { adminSocialLinksRoute } from './social-links'

export const adminSystemRoute = new Hono<AppContext>()

adminSystemRoute.route(
  '/system/email-sender-profiles',
  adminEmailSenderProfilesRoute
)

adminSystemRoute.route('/system/social-links', adminSocialLinksRoute)
