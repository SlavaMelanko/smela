import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission } from '@/middleware'
import Permission from '@/types/permission'

import { adminEmailSenderProfileByProfileRoute } from './$profile'
import { getEmailSenderProfilesHandler } from './handler'

export const adminEmailSenderProfilesRoute = new Hono<AppContext>()

adminEmailSenderProfilesRoute.get(
  '/',
  requirePermission(Permission.ViewSystem),
  getEmailSenderProfilesHandler
)

adminEmailSenderProfilesRoute.route(
  '/:profile',
  adminEmailSenderProfileByProfileRoute
)
