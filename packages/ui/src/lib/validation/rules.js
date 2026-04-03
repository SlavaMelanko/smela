import * as yup from 'yup'

import { allUserStatuses } from '../types/index.js'
import {
  DescriptionConstraint,
  EmailConstraint,
  NameConstraint,
  PasswordConstraint,
  TeamNameConstraint
} from './constants'

const requiredStr = errorMessage => yup.string().trim().required(errorMessage)

const optionalStr = () =>
  yup
    .string()
    .trim()
    .transform(value => (value === '' ? undefined : value))

export const firstName = requiredStr('firstName.error.required')
  .min(NameConstraint.MIN_LENGTH, 'firstName.error.min')
  .max(NameConstraint.MAX_LENGTH, 'firstName.error.max')

export const lastName = {
  required: requiredStr('lastName.error.required')
    .min(NameConstraint.MIN_LENGTH, 'lastName.error.min')
    .max(NameConstraint.MAX_LENGTH, 'lastName.error.max'),

  // Optional version - validates when provided but not required
  optional: yup
    .string()
    .trim()
    .transform(value => (value === '' ? undefined : value))
    .min(NameConstraint.MIN_LENGTH, 'lastName.error.min')
    .max(NameConstraint.MAX_LENGTH, 'lastName.error.max')
}

export const email = {
  new: requiredStr('email.error.required').matches(
    EmailConstraint.STANDARD,
    'email.error.format'
  )
}

export const captcha = requiredStr('captcha.error')

export const password = {
  new: requiredStr('password.error.required')
    .min(PasswordConstraint.MIN_LENGTH, 'password.error.min')
    .matches(PasswordConstraint.STRONG, {
      message: 'password.error.strong',
      excludeEmptyString: true
    })
}

export const url = errorMessage =>
  yup
    .string()
    .trim()
    .transform(value => (value === '' ? undefined : value))
    .url(errorMessage)

export const teamName = errors =>
  requiredStr(errors.required)
    .min(TeamNameConstraint.MIN_LENGTH, errors.min)
    .max(TeamNameConstraint.MAX_LENGTH, errors.max)

export const description = errorMessage =>
  optionalStr().max(DescriptionConstraint.MAX_LENGTH, errorMessage)

export const position = optionalStr()
  .min(NameConstraint.MIN_LENGTH, 'position.error.min')
  .max(NameConstraint.MAX_LENGTH, 'position.error.max')

export const status = yup
  .string()
  .required('status.error.required')
  .oneOf(allUserStatuses, 'status.error.invalid')
