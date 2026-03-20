import { createResolver, rules } from '@/lib/validation'

export const FieldName = {
  EMAIL: 'email'
}

export const getDefaultValues = () => ({
  [FieldName.EMAIL]: ''
})

export const resolver = createResolver({
  [FieldName.EMAIL]: rules.email.new
})
