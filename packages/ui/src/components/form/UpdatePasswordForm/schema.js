import { createResolver, rules } from '@ui/lib/validation'

export const FieldName = {
  CURRENT_PASSWORD: 'currentPassword',
  NEW_PASSWORD: 'newPassword'
}

export const getDefaultValues = () => ({
  [FieldName.CURRENT_PASSWORD]: '',
  [FieldName.NEW_PASSWORD]: ''
})

export const resolver = createResolver(
  {
    [FieldName.CURRENT_PASSWORD]: rules.password.new,
    [FieldName.NEW_PASSWORD]: rules.password.new
  },
  (data, ctx) => {
    if (data[FieldName.NEW_PASSWORD] === data[FieldName.CURRENT_PASSWORD]) {
      ctx.addIssue({
        code: 'custom',
        path: [FieldName.NEW_PASSWORD],
        message: 'password.error.same'
      })
    }
  }
)
