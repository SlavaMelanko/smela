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

export const resolver = createResolver({
  [FieldName.NAME]: rules.displayName,
  [FieldName.WEBSITE]: rules.url('team.website.error.format'),
  [FieldName.DESCRIPTION]: rules.description
})
