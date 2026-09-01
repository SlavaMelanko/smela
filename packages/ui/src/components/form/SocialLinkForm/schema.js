import { createResolver, rules } from '@ui/lib/validation'

export const FieldName = {
  NETWORK: 'network',
  URL: 'url',
  SVG: 'svg'
}

export const getDefaultValues = () => ({
  [FieldName.NETWORK]: '',
  [FieldName.URL]: '',
  [FieldName.SVG]: ''
})

export const getValues = ({ network, url, svg }) => ({
  [FieldName.NETWORK]: network ?? '',
  [FieldName.URL]: url ?? '',
  [FieldName.SVG]: svg ?? ''
})

export const resolver = createResolver({
  [FieldName.NETWORK]: rules.displayName,
  [FieldName.URL]: rules.url.required,
  [FieldName.SVG]: rules.socialLink.svg
})
