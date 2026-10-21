import { createResolver, rules } from '@ui/lib/validation'

export const FieldName = {
  NICKNAME: 'nickname',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  STATUS: 'status'
}

export const getDefaultValues = () => ({
  [FieldName.NICKNAME]: '',
  [FieldName.FIRST_NAME]: '',
  [FieldName.LAST_NAME]: '',
  [FieldName.STATUS]: ''
})

export const getValues = ({ nickname, firstName, lastName, status }) => ({
  [FieldName.NICKNAME]: nickname ?? '',
  [FieldName.FIRST_NAME]: firstName ?? '',
  [FieldName.LAST_NAME]: lastName ?? '',
  [FieldName.STATUS]: status ?? ''
})

export const resolver = createResolver({
  [FieldName.NICKNAME]: rules.nickname,
  [FieldName.FIRST_NAME]: rules.optionalName('firstName'),
  [FieldName.LAST_NAME]: rules.optionalName('lastName'),
  [FieldName.STATUS]: rules.status
})

export const defaultFields = Object.fromEntries(
  Object.values(FieldName).map(name => [name, true])
)
