import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody, verifyCaptcha } from '@/middleware'

import { loginHandler } from './handler'
import { loginBodySchema } from './schema'

export const loginRoute = new Hono<AppContext>()

loginRoute.post(
  '/login',
  validateBody(loginBodySchema),
  verifyCaptcha(),
  loginHandler
)
