import { createResolver, rules } from '@ui/lib/validation'

export const FieldName = {
  NAME: 'name',
  WEBSITE: 'website',
  DESCRIPTION: 'description'
}

export const getDefaultValues = () => ({
  [FieldName.NAME]: '',
  [FieldName.WEBSITE]: '',
  [FieldName.DESCRIPTION]: ''
})

export const getValues = ({ name, website, description }) => ({
  [FieldName.NAME]: name ?? '',
  [FieldName.WEBSITE]: website ?? '',
  [FieldName.DESCRIPTION]: description ?? ''
})

export const resolver = createResolver({
  [FieldName.NAME]: rules.displayName,
  [FieldName.WEBSITE]: rules.url.optional,
  [FieldName.DESCRIPTION]: rules.description
})
