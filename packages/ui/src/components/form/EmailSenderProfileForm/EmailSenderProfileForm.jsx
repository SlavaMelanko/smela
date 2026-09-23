// React Compiler breaks RHF's proxy-based isDirty subscription
'use no memo'

import {
  FormActions,
  FormField,
  FormFields,
  FormReadOnly,
  FormRoot,
  FormRow,
  SubmitButton
} from '@ui/components/form'
import { Input, Textarea } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { FieldName, getDefaultValues, getValues, resolver } from './schema'

export const EmailSenderProfileForm = ({
  senderProfile,
  isSubmitting,
  onSubmit,
  canManageSystem = false
}) => {
  const { t, formatDate } = useLocale()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    resolver,
    defaultValues: getDefaultValues()
  })

  useEffect(() => {
    if (senderProfile) {
      reset(getValues(senderProfile))
    }
  }, [senderProfile, reset])

  return (
    <FormRoot onSubmit={handleSubmit(onSubmit)}>
      <FormFields>
        <FormField label={t('profile.label')} optional>
          <FormReadOnly>
            {senderProfile.profile.charAt(0).toUpperCase() +
              senderProfile.profile.slice(1)}
          </FormReadOnly>
        </FormField>

        <FormRow>
          <FormField
            label={t('name.label')}
            name={FieldName.NAME}
            error={errors[FieldName.NAME]}
          >
            <Input {...register(FieldName.NAME)} readOnly={!canManageSystem} />
          </FormField>

          <FormField
            label={t('email.label')}
            name={FieldName.EMAIL}
            error={errors[FieldName.EMAIL]}
          >
            <Input {...register(FieldName.EMAIL)} readOnly={!canManageSystem} />
          </FormField>
        </FormRow>

        <FormField
          label={t('description.label')}
          name={FieldName.DESCRIPTION}
          error={errors[FieldName.DESCRIPTION]}
          optional
        >
          <Textarea
            {...register(FieldName.DESCRIPTION)}
            readOnly={!canManageSystem}
          />
        </FormField>

        <FormRow forceColumns>
          <FormField label={t('createdAt')} optional>
            <FormReadOnly>{formatDate(senderProfile.createdAt)}</FormReadOnly>
          </FormField>
          <FormField label={t('updatedAt')} optional>
            <FormReadOnly>{formatDate(senderProfile.updatedAt)}</FormReadOnly>
          </FormField>
        </FormRow>

        {canManageSystem && (
          <FormActions isDirty={isDirty}>
            <SubmitButton isLoading={isSubmitting}>{t('save')}</SubmitButton>
          </FormActions>
        )}
      </FormFields>
    </FormRoot>
  )
}
