import { z } from 'zod'

import { allUserStatuses } from '../types/index.js'
import {
  DescriptionConstraint,
  EmailConstraint,
  NameConstraint,
  PasswordConstraint,
  TeamNameConstraint
} from './constants'

const requiredStr = errorMessage => z.string().trim().min(1, errorMessage)

const optionalStr = () =>
  z
    .string()
    .trim()
    .transform(value => (value === '' ? undefined : value))
    .optional()

export const firstName = requiredStr('firstName.error.required')
  .min(NameConstraint.MIN_LENGTH, 'firstName.error.min')
  .max(NameConstraint.MAX_LENGTH, 'firstName.error.max')

export const lastName = {
  required: requiredStr('lastName.error.required')
    .min(NameConstraint.MIN_LENGTH, 'lastName.error.min')
    .max(NameConstraint.MAX_LENGTH, 'lastName.error.max'),

  // Optional version - validates when provided but not required
  optional: z
    .string()
    .trim()
    .transform(value => (value === '' ? undefined : value))
    .optional()
    .refine(
      value => value === undefined || value.length >= NameConstraint.MIN_LENGTH,
      'lastName.error.min'
    )
    .refine(
      value => value === undefined || value.length <= NameConstraint.MAX_LENGTH,
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
  z
    .string()
    .trim()
    .transform(value => (value === '' ? undefined : value))
    .optional()
    .refine(
      value => value === undefined || z.url().safeParse(value).success,
      errorMessage
    )

export const teamName = errors =>
  requiredStr(errors.required)
    .min(TeamNameConstraint.MIN_LENGTH, errors.min)
    .max(TeamNameConstraint.MAX_LENGTH, errors.max)

export const description = errorMessage =>
  optionalStr().refine(
    value =>
      value === undefined || value.length <= DescriptionConstraint.MAX_LENGTH,
    errorMessage
  )

export const position = z
  .string()
  .trim()
  .transform(value => (value === '' ? undefined : value))
  .optional()
  .refine(
    value => value === undefined || value.length >= NameConstraint.MIN_LENGTH,
    'position.error.min'
  )
  .refine(
    value => value === undefined || value.length <= NameConstraint.MAX_LENGTH,
    'position.error.max'
  )

export const status = z
  .string()
  .min(1, 'status.error.required')
  .refine(value => allUserStatuses.includes(value), 'status.error.invalid')
