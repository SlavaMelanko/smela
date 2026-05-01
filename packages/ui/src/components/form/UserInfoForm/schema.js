import { createResolver, rules } from '@ui/lib/validation'

export const FieldName = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  STATUS: 'status'
}

export const getDefaultValues = () => ({
  [FieldName.FIRST_NAME]: '',
  [FieldName.LAST_NAME]: '',
  [FieldName.STATUS]: ''
})

export const getValues = ({ firstName, lastName, status }) => ({
  [FieldName.FIRST_NAME]: firstName ?? '',
  [FieldName.LAST_NAME]: lastName ?? '',
  [FieldName.STATUS]: status ?? ''
})

export const resolver = createResolver({
  [FieldName.FIRST_NAME]: rules.firstName,
  [FieldName.LAST_NAME]: rules.lastName.optional,
  [FieldName.STATUS]: rules.status
})

export const defaultFields = Object.fromEntries(
  Object.values(FieldName).map(name => [name, true])
)
