import { createMiddleware } from 'hono/factory'

import type { AppContext } from '@/context'
import type { Permission } from '@/types'

import { AppError, ErrorCode } from '@/errors'

export const requirePermission = (permission: Permission) =>
  createMiddleware<AppContext>(async (c, next) => {
    const { permissions } = c.get('user')

    if (!permissions?.includes(permission)) {
      throw new AppError(ErrorCode.Forbidden)
    }

    return next()
  })
