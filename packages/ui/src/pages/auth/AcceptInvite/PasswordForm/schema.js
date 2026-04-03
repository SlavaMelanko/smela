import { createResolver, rules } from '@/lib/validation'

export const FieldName = {
  NEW_PASSWORD: 'newPassword'
}

export const getDefaultValues = () => ({
  [FieldName.NEW_PASSWORD]: ''
})

export const resolver = createResolver({
  [FieldName.NEW_PASSWORD]: rules.password.new
})
