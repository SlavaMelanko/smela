import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody, verifyCaptcha } from '@/middleware'

import { resendVerificationEmailHandler } from './handler'
import { resendVerificationEmailBodySchema } from './schema'

export const resendVerificationEmailRoute = new Hono<AppContext>()

resendVerificationEmailRoute.post(
  '/resend-verification-email',
  validateBody(resendVerificationEmailBodySchema),
  verifyCaptcha(),
  resendVerificationEmailHandler
)
