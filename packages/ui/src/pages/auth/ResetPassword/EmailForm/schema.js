import { createResolver, rules } from '@ui/lib/validation'

export const FieldName = {
  EMAIL: 'email'
}

export const getDefaultValues = () => ({
  [FieldName.EMAIL]: ''
})

export const resolver = createResolver({
  [FieldName.EMAIL]: rules.email.new
})
