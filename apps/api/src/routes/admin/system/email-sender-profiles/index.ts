import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import { getEmailSenderProfiles } from '@/use-cases/admin'

import { adminEmailSenderProfileByProfileRoute } from './$profile'

export const adminEmailSenderProfilesRoute = new Hono<AppContext>()

adminEmailSenderProfilesRoute.get(
  '/',
  requirePermission(Permission.ViewSystem),
  async c => {
    const result = await getEmailSenderProfiles()

    return c.json(result, HttpStatus.OK)
  }
)

adminEmailSenderProfilesRoute.route(
  '/:profile',
  adminEmailSenderProfileByProfileRoute
)
