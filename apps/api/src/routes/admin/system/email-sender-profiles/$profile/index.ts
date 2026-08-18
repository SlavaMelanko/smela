import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody, validateParams } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import {
  getEmailSenderProfile,
  updateEmailSenderProfile
} from '@/use-cases/admin'

import {
  emailSenderProfileParamsSchema,
  updateEmailSenderProfileBodySchema
} from './schema'

export const adminEmailSenderProfileByProfileRoute = new Hono<AppContext>()

adminEmailSenderProfileByProfileRoute.get(
  '/',
  validateParams(emailSenderProfileParamsSchema),
  requirePermission(Permission.ViewSystem),
  async c => {
    const { profile } = c.req.valid('param')

    const result = await getEmailSenderProfile(profile)

    return c.json(result, HttpStatus.OK)
  }
)

adminEmailSenderProfileByProfileRoute.patch(
  '/',
  validateParams(emailSenderProfileParamsSchema),
  validateBody(updateEmailSenderProfileBodySchema),
  requirePermission(Permission.ManageSystem),
  async c => {
    const { profile } = c.req.valid('param')
    const body = c.req.valid('json')

    const result = await updateEmailSenderProfile(profile, body)

    return c.json(result, HttpStatus.OK)
  }
)
