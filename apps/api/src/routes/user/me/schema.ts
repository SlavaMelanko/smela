import { z } from 'zod'

import { rules } from '@/routes/rules'

export const updateProfileSchema = z
  .object({
    nickname: rules.user.nickname.optional(),
    firstName: rules.user.name.nullish(),
    lastName: rules.user.name.nullish()
  })
  .strict()

export const changePasswordSchema = z
  .object({
    currentPassword: rules.user.password,
    newPassword: rules.user.password
  })
  .strict()
