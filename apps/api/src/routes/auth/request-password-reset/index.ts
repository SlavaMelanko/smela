import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody, verifyCaptcha } from '@/middleware'

import { requestPasswordResetHandler } from './handler'
import { requestPasswordResetBodySchema } from './schema'

export const requestPasswordResetRoute = new Hono<AppContext>()

requestPasswordResetRoute.post(
  '/request-password-reset',
  validateBody(requestPasswordResetBodySchema),
  verifyCaptcha(),
  requestPasswordResetHandler
)
