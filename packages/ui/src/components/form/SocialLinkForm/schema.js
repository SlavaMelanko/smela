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

export const getValues = ({ name, url, svg }) => ({
  [FieldName.NAME]: name ?? '',
  [FieldName.URL]: url ?? '',
  [FieldName.SVG]: svg ?? ''
})

export const resolver = createResolver({
  [FieldName.NAME]: rules.displayName,
  [FieldName.URL]: rules.url.required,
  [FieldName.SVG]: rules.socialLink.svg
})
