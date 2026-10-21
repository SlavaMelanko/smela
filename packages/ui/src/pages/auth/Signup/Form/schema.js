import { createResolver, rules } from '@ui/lib/validation'

export const FieldName = {
  NICKNAME: 'nickname',
  EMAIL: 'email',
  PASSWORD: 'password'
}

export const getDefaultValues = () => ({
  [FieldName.NICKNAME]: '',
  [FieldName.EMAIL]: '',
  [FieldName.PASSWORD]: ''
})

export const resolver = createResolver({
  [FieldName.NICKNAME]: rules.nickname,
  [FieldName.EMAIL]: rules.email.new,
  [FieldName.PASSWORD]: rules.password.new
})
