import { createResolver, rules } from '@ui/lib/validation'

export const FieldName = {
  NICKNAME: 'nickname',
  NEW_PASSWORD: 'newPassword'
}

export const getDefaultValues = () => ({
  [FieldName.NICKNAME]: '',
  [FieldName.NEW_PASSWORD]: ''
})

const passwordRules = {
  [FieldName.NEW_PASSWORD]: rules.password.new
}

export const createAcceptInviteResolver = withNickname =>
  createResolver(
    withNickname
      ? { [FieldName.NICKNAME]: rules.nickname, ...passwordRules }
      : passwordRules
  )
