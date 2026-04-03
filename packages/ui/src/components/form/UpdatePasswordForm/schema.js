import { createResolver, rules } from '@/lib/validation'

export const FieldName = {
  CURRENT_PASSWORD: 'currentPassword',
  NEW_PASSWORD: 'newPassword'
}

export const getDefaultValues = () => ({
  [FieldName.CURRENT_PASSWORD]: '',
  [FieldName.NEW_PASSWORD]: ''
})

export const resolver = createResolver({
  [FieldName.CURRENT_PASSWORD]: rules.password.new,
  [FieldName.NEW_PASSWORD]: rules.password.new.test(
    'different-from-current',
    'password.error.same',
    function (value) {
      return value !== this.parent[FieldName.CURRENT_PASSWORD]
    }
  )
})
