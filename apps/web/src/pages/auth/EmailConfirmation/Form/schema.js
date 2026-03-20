import { createResolver, rules } from '@/lib/validation'

export const FieldName = {
  EMAIL: 'email'
}

export const getDefaultValues = email => ({
  [FieldName.EMAIL]: email || ''
})

export const resolver = createResolver({
  [FieldName.EMAIL]: rules.email.new
})
