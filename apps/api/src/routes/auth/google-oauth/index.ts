import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { googleCallbackHandler, googleRedirectHandler } from './handler'

export const googleOAuthRoute = new Hono<AppContext>()

googleOAuthRoute.get('/google', googleRedirectHandler)
googleOAuthRoute.get('/google/callback', googleCallbackHandler)
