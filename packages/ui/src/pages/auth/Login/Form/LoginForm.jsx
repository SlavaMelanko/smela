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

import { FieldName, getDefaultValues, resolver } from './schema'

export const LoginForm = ({ isLoading, onSubmit }) => {
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
          label={t('email.label')}
          name={FieldName.EMAIL}
          error={errors[FieldName.EMAIL]}
        >
          <Input {...register(FieldName.EMAIL)} />
        </FormField>

        <FormField
          label={t('password.label.default')}
          name={FieldName.PASSWORD}
          error={errors[FieldName.PASSWORD]}
        >
          <PasswordInput {...register(FieldName.PASSWORD)} />
        </FormField>
      </FormFields>

      <SubmitButton isLoading={isSubmitting || isLoading}>
        {t('login.verb')}
      </SubmitButton>
    </FormRoot>
  )
}
