import { z } from 'zod'

import { rules } from '@/routes/rules'

export const updateProfileSchema = z
  .object({
    firstName: rules.user.firstName.optional(),
    lastName: rules.user.lastName.optional()
  })
  .strict()

export const changePasswordSchema = z
  .object({
    currentPassword: rules.user.password,
    newPassword: rules.user.password
  })
  .strict()
