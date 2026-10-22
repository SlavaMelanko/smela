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

const fieldRules = {
  [FieldName.FIRST_NAME]: rules.firstName.required,
  [FieldName.LAST_NAME]: rules.lastName.optional,
  [FieldName.EMAIL]: rules.email.new,
  [FieldName.POSITION]: rules.position,
  [FieldName.PERMISSIONS]: rules.permissions
}

// Validate only visible fields, so a hidden required field can't block submit
export const createInviteResolver = fields =>
  createResolver(
    Object.fromEntries(
      Object.entries(fieldRules).filter(([name]) => fields[name])
    )
  )

export const defaultFields = Object.fromEntries(
  Object.values(FieldName).map(name => [name, true])
)
