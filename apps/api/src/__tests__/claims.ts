import type { MiddlewareHandler } from 'hono'

import type { UserClaims } from '@/security/jwt'

import { Role, UserStatus } from '@/types'

import { testUuids } from './uuid'

// Injects user claims into context, standing in for the real auth guard
// in endpoint tests. The guard itself is covered in middleware/auth tests
export const withClaims = (
  claims: Partial<UserClaims> = {}
): MiddlewareHandler => {
  return async (c, next) => {
    c.set('user', {
      id: testUuids.USER_1,
      email: 'user@example.com',
      role: Role.User,
      status: UserStatus.Active,
      ...claims
    })

    await next()
  }
}
