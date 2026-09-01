import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import { getSocialLinks } from '@/use-cases/admin'

import { adminSocialLinkByNetworkRoute } from './$network'

export const adminSocialLinksRoute = new Hono<AppContext>()

adminSocialLinksRoute.get(
  '/',
  requirePermission(Permission.ViewSystem),
  async c => {
    const result = await getSocialLinks()

    return c.json(result, HttpStatus.OK)
  }
)

adminSocialLinksRoute.route('/:network', adminSocialLinkByNetworkRoute)
