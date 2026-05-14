import { createResolver, rules } from '@ui/lib/validation'
import { z } from 'zod'

export const FieldName = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  EMAIL: 'email',
  POSITION: 'position',
  PERMISSIONS: 'permissions'
}

export const getDefaultValues = () => ({
  [FieldName.FIRST_NAME]: '',
  [FieldName.LAST_NAME]: '',
  [FieldName.EMAIL]: '',
  [FieldName.POSITION]: ''
})

export const resolver = createResolver({
  [FieldName.FIRST_NAME]: rules.firstName,
  [FieldName.LAST_NAME]: rules.lastName.optional,
  [FieldName.EMAIL]: rules.email.new,
  [FieldName.POSITION]: rules.position,
  [FieldName.PERMISSIONS]: z
    .record(z.string(), z.record(z.string(), z.boolean()))
    .optional()
})

export const defaultFields = Object.fromEntries(
  Object.values(FieldName).map(name => [name, true])
)
