import { createResolver, rules } from '@/lib/validation'

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
  [FieldName.NAME]: rules.teamName({
    required: 'team.name.error.required',
    min: 'team.name.error.min',
    max: 'team.name.error.max'
  }),
  [FieldName.WEBSITE]: rules.url('team.website.error.format'),
  [FieldName.DESCRIPTION]: rules.description('team.description.error.max')
})
