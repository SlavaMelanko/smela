import { useForm } from 'react-hook-form'

import {
  FormField,
  FormFields,
  FormRoot,
  SubmitButton
} from '@/components/form'
import { PasswordInput } from '@/components/inputs'
import { Input } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'

import { FieldName, getDefaultValues, resolver } from './schema'

export const SignupForm = ({ isLoading, onSubmit }) => {
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
          label={t('firstName.label')}
          name={FieldName.FIRST_NAME}
          error={errors[FieldName.FIRST_NAME]}
        >
          <Input {...register(FieldName.FIRST_NAME)} />
        </FormField>

        <FormField
          label={t('lastName.label')}
          name={FieldName.LAST_NAME}
          error={errors[FieldName.LAST_NAME]}
          optional
        >
          <Input {...register(FieldName.LAST_NAME)} />
        </FormField>

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
        {t('signUp')}
      </SubmitButton>
    </FormRoot>
  )
}
