// React Compiler breaks RHF's proxy-based isDirty subscription
'use no memo'

import {
  FormActions,
  FormField,
  FormFields,
  FormRoot,
  FormRow,
  SubmitButton
} from '@ui/components/form'
import { PasswordInput } from '@ui/components/inputs/PasswordInput'
import { useLocale } from '@ui/hooks/useLocale'
import { useForm } from 'react-hook-form'

import { FieldName, getDefaultValues, resolver } from './schema'

export const UpdatePasswordForm = ({ isSubmitting, onSubmit }) => {
  const { t } = useLocale()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    resolver,
    defaultValues: getDefaultValues()
  })

  return (
    <FormRoot onSubmit={handleSubmit(data => onSubmit(data, reset))}>
      <FormFields>
        <FormRow>
          <FormField
            label={t('password.label.current')}
            name={FieldName.CURRENT_PASSWORD}
            error={errors[FieldName.CURRENT_PASSWORD]}
          >
            <PasswordInput {...register(FieldName.CURRENT_PASSWORD)} />
          </FormField>

          <FormField
            label={t('password.label.new')}
            name={FieldName.NEW_PASSWORD}
            error={errors[FieldName.NEW_PASSWORD]}
          >
            <PasswordInput {...register(FieldName.NEW_PASSWORD)} />
          </FormField>
        </FormRow>

        <p className='text-muted-foreground text-sm'>
          {t('password.update.hint')}
        </p>

        <FormActions isDirty={isDirty}>
          <SubmitButton isLoading={isSubmitting}>
            {t('password.update.cta')}
          </SubmitButton>
        </FormActions>
      </FormFields>
    </FormRoot>
  )
}
