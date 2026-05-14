import { createResolver, rules } from '@ui/lib/validation'

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
  [FieldName.PERMISSIONS]: rules.permissions
})

export const defaultFields = Object.fromEntries(
  Object.values(FieldName).map(name => [name, true])
)
