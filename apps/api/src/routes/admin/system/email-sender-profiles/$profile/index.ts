import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody, validateParams } from '@/middleware'
import { Permission } from '@/types'

import {
  getEmailSenderProfileHandler,
  updateEmailSenderProfileHandler
} from './handler'
import {
  emailSenderProfileParamsSchema,
  updateEmailSenderProfileBodySchema
} from './schema'

export const adminEmailSenderProfileByProfileRoute = new Hono<AppContext>()

adminEmailSenderProfileByProfileRoute.get(
  '/',
  validateParams(emailSenderProfileParamsSchema),
  requirePermission(Permission.ViewSystem),
  getEmailSenderProfileHandler
)

adminEmailSenderProfileByProfileRoute.patch(
  '/',
  validateParams(emailSenderProfileParamsSchema),
  validateBody(updateEmailSenderProfileBodySchema),
  requirePermission(Permission.ManageSystem),
  updateEmailSenderProfileHandler
)
