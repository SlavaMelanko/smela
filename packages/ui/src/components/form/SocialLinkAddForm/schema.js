import { createResolver, rules } from '@ui/lib/validation'

export const FieldName = {
  NAME: 'name',
  URL: 'url',
  SVG: 'svg'
}

export const getDefaultValues = () => ({
  [FieldName.NAME]: '',
  [FieldName.URL]: '',
  [FieldName.SVG]: ''
})

export const resolver = createResolver({
  [FieldName.NAME]: rules.displayName,
  [FieldName.URL]: rules.url.required,
  [FieldName.SVG]: rules.svg
})
