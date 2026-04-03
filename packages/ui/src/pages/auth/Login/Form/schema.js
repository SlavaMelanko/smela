import { createResolver, rules } from '@/lib/validation'

export const FieldName = {
  EMAIL: 'email',
  PASSWORD: 'password'
}

export const getDefaultValues = () => ({
  [FieldName.EMAIL]: '',
  [FieldName.PASSWORD]: ''
})

export const resolver = createResolver({
  [FieldName.EMAIL]: rules.email.new,
  [FieldName.PASSWORD]: rules.password.new
})
