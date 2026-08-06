import { createResolver, rules } from '@ui/lib/validation'

export const FieldName = {
  NAME: 'name',
  EMAIL: 'email',
  DESCRIPTION: 'description'
}

export const getDefaultValues = () => ({
  [FieldName.NAME]: '',
  [FieldName.EMAIL]: '',
  [FieldName.DESCRIPTION]: ''
})

export const getValues = ({ name, email, description }) => ({
  [FieldName.NAME]: name ?? '',
  [FieldName.EMAIL]: email ?? '',
  [FieldName.DESCRIPTION]: description ?? ''
})

export const resolver = createResolver({
  [FieldName.NAME]: rules.displayName,
  [FieldName.EMAIL]: rules.email.new,
  [FieldName.DESCRIPTION]: rules.description
})
