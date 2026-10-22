import {
  FormField,
  FormFields,
  FormRoot,
  SubmitButton
} from '@ui/components/form'
import { PasswordInput } from '@ui/components/inputs'
import { Input } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useForm } from 'react-hook-form'

import {
  createAcceptInviteResolver,
  FieldName,
  getDefaultValues
} from './schema'

export const AcceptInviteForm = ({
  isLoading,
  onSubmit,
  withNickname = false
}) => {
  const { t } = useLocale()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: createAcceptInviteResolver(withNickname),
    defaultValues: getDefaultValues()
  })

  return (
    <FormRoot onSubmit={handleSubmit(data => onSubmit(data))}>
      <FormFields>
        {withNickname && (
          <FormField
            label={t('nickname.label')}
            name={FieldName.NICKNAME}
            error={errors[FieldName.NICKNAME]}
          >
            <Input {...register(FieldName.NICKNAME)} />
          </FormField>
        )}

        <FormField
          label={t('password.label.default')}
          name={FieldName.NEW_PASSWORD}
          error={errors[FieldName.NEW_PASSWORD]}
        >
          <PasswordInput {...register(FieldName.NEW_PASSWORD)} />
        </FormField>
      </FormFields>

      <SubmitButton isLoading={isSubmitting || isLoading}>
        {t('invite.accept.cta')}
      </SubmitButton>
    </FormRoot>
  )
}
