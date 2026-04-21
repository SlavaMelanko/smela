import {
  FormField,
  FormFields,
  FormRoot,
  SubmitButton
} from '@ui/components/form'
import { Input } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useForm } from 'react-hook-form'

import { FieldName, getDefaultValues, resolver } from './schema'

export const EmailForm = ({ isLoading, onSubmit }) => {
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
      </FormFields>

      <SubmitButton isLoading={isSubmitting || isLoading}>
        {t('password.reset.request.cta')}
      </SubmitButton>
    </FormRoot>
  )
}
