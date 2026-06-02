import {
  isActive,
  isActiveOnly,
  isAdmin,
  isNewOrActive,
  isOwner,
  isUserOrAdmin
} from '@/types'

import { createAuthMiddleware } from './factory'

/**
 * User authentication - allows new users.
 * - Uses JWT via Authorization: Bearer <token> header.
 * - Allows users with status New, Verified, Trial, or Active.
 * - Accepts all roles: User, Admin, Owner.
 */
export const requireUserAuth = createAuthMiddleware(
  isNewOrActive,
  isUserOrAdmin
)

/**
 * Strict user authentication - requires verified users only.
 * - Uses JWT via Authorization: Bearer <token> header.
 * - Requires user status to be Verified, Trial, or Active.
 * - Accepts all roles: User, Admin, Owner (for role inheritance).
 */
export const requireVerifiedUserAuth = createAuthMiddleware(
  isActive,
  isUserOrAdmin
)

/**
 * Admin authentication - requires admin privileges.
 * - Uses JWT via Authorization: Bearer <token> header.
 * - Requires user status to be exactly Active (not Verified or Trial).
 * - Requires user role to be Admin or Owner.
 */
export const requireAdminAuth = createAuthMiddleware(isActiveOnly, isAdmin)

/**
 * Owner authentication - requires owner privileges.
 * - Uses JWT via Authorization: Bearer <token> header.
 * - Requires user status to be exactly Active (not Verified or Trial).
 * - Requires user role to be Owner only.
 * - Use this for critical operations like adding/removing admins.
 */
export const requireOwnerAuth = createAuthMiddleware(isActiveOnly, isOwner)
