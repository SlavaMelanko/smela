import { createResolver, rules } from '@ui/lib/validation'

export const FieldName = {
  NAME: 'name',
  URL: 'url'
}

export const getDefaultValues = () => ({
  [FieldName.NAME]: '',
  [FieldName.URL]: ''
})

export const resolver = createResolver({
  [FieldName.NAME]: rules.displayName,
  [FieldName.URL]: rules.url.required
})
