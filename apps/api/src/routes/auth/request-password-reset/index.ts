import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody, verifyCaptcha } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { requestPasswordReset } from '@/use-cases/auth/request-password-reset'

import { requestPasswordResetBodySchema } from './schema'

export const requestPasswordResetRoute = new Hono<AppContext>()

requestPasswordResetRoute.post(
  '/request-password-reset',
  validateBody(requestPasswordResetBodySchema),
  verifyCaptcha(),
  async c => {
    const { email, preferences } = c.req.valid('json')

    const result = await requestPasswordReset({ email }, preferences)

    return c.json(result, HttpStatus.ACCEPTED)
  }
)
