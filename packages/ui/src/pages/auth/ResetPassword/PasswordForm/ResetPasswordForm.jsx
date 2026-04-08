import {
  FormField,
  FormFields,
  FormRoot,
  SubmitButton
} from '@ui/components/form'
import { PasswordInput } from '@ui/components/inputs'
import { useLocale } from '@ui/hooks/useLocale'
import { useForm } from 'react-hook-form'

import { FieldName, getDefaultValues, resolver } from './schema'

export const ResetPasswordForm = ({ isLoading, onSubmit }) => {
  const { t } = useLocale()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver,
    defaultValues: getDefaultValues()
  })

  return (
    <FormRoot onSubmit={handleSubmit(data => onSubmit(data))}>
      <FormFields>
        <FormField
          label={t('password.label.new')}
          name={FieldName.NEW_PASSWORD}
          error={errors[FieldName.NEW_PASSWORD]}
        >
          <PasswordInput {...register(FieldName.NEW_PASSWORD)} />
        </FormField>
      </FormFields>

      <SubmitButton isLoading={isSubmitting || isLoading}>
        {t('password.reset.set.cta')}
      </SubmitButton>
    </FormRoot>
  )
}
