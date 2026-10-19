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

// Team routes run after requireTeamAccess, which resolves the caller's team permissions
export const requireTeamPermission = (permission: Permission) =>
  createMiddleware<AppContext>(async (c, next) => {
    if (!c.get('teamPermissions')?.includes(permission)) {
      throw new AppError(ErrorCode.Forbidden)
    }

    return next()
  })

export const requireSelfOrTeamPermission = (permission: Permission) =>
  createMiddleware<AppContext>(async (c, next) => {
    const { id } = c.get('user')
    const memberId = c.req.param('memberId')

    if (id !== memberId && !c.get('teamPermissions')?.includes(permission)) {
      throw new AppError(ErrorCode.Forbidden)
    }

    return next()
  })
