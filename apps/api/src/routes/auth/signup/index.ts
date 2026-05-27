import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody, verifyCaptcha } from '@/middleware'

import { signupHandler } from './handler'
import { signupBodySchema } from './schema'

export const signupRoute = new Hono<AppContext>()

signupRoute.post(
  '/signup',
  validateBody(signupBodySchema),
  verifyCaptcha(),
  signupHandler
)
