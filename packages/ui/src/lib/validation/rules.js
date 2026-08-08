import { z } from 'zod'

import { allUserStatuses } from '../types/index.js'
import {
  DescriptionConstraint,
  EmailConstraint,
  NameConstraint,
  PasswordConstraint
} from './constants'

const requiredStr = errorMessage => z.string().trim().nonempty(errorMessage)

const optionalStr = () =>
  z
    .string()
    .trim()
    .transform(v => v || undefined)
    .pipe(z.string().optional())

export const firstName = requiredStr('firstName.error.required')
  .min(NameConstraint.MIN_LENGTH, 'firstName.error.min')
  .max(NameConstraint.MAX_LENGTH, 'firstName.error.max')

export const lastName = {
  required: requiredStr('lastName.error.required')
    .min(NameConstraint.MIN_LENGTH, 'lastName.error.min')
    .max(NameConstraint.MAX_LENGTH, 'lastName.error.max'),

  // Optional version - validates when provided but not required
  optional: optionalStr()
    .refine(
      value => !value || value.length >= NameConstraint.MIN_LENGTH,
      'lastName.error.min'
    )
    .refine(
      value => !value || value.length <= NameConstraint.MAX_LENGTH,
      'lastName.error.max'
    )
}

export const email = {
  new: requiredStr('email.error.required').regex(
    EmailConstraint.STANDARD,
    'email.error.format'
  )
}

export const captcha = requiredStr('captcha.error')

export const password = {
  new: requiredStr('password.error.required')
    .min(PasswordConstraint.MIN_LENGTH, 'password.error.min')
    .regex(PasswordConstraint.STRONG, 'password.error.strong')
}

export const url = errorMessage =>
  optionalStr().refine(
    value => value === undefined || z.url().safeParse(value).success,
    errorMessage
  )

export const displayName = requiredStr('name.error.required')
  .min(NameConstraint.MIN_LENGTH, 'name.error.min')
  .max(NameConstraint.MAX_LENGTH, 'name.error.max')

export const description = optionalStr().refine(
  value =>
    value === undefined || value.length <= DescriptionConstraint.MAX_LENGTH,
  'description.error.max'
)

export const position = optionalStr()
  .refine(
    value => !value || value.length >= NameConstraint.MIN_LENGTH,
    'position.error.min'
  )
  .refine(
    value => !value || value.length <= NameConstraint.MAX_LENGTH,
    'position.error.max'
  )

export const status = requiredStr('status.error.required').refine(
  value => allUserStatuses.includes(value),
  'status.error.invalid'
)

export const permissions = z
  .record(z.string(), z.record(z.string(), z.boolean()))
  .optional()
