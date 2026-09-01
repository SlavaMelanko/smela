import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateParams } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import { getSocialLink } from '@/use-cases/admin'

import { socialLinkParamsSchema } from './schema'

export const adminSocialLinkByNetworkRoute = new Hono<AppContext>()

adminSocialLinkByNetworkRoute.get(
  '/',
  validateParams(socialLinkParamsSchema),
  requirePermission(Permission.ViewSystem),
  async c => {
    const { network } = c.req.valid('param')

    const result = await getSocialLink(network)

    return c.json(result, HttpStatus.OK)
  }
)
