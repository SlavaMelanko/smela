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

export const TeamGeneralForm = ({ team, isSubmitting, onSubmit }) => {
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
    if (team) {
      reset(getValues(team))
    }
  }, [team, reset])

  return (
    <FormRoot onSubmit={handleSubmit(onSubmit)}>
      <FormFields>
        <FormRow>
          <FormField
            label={t('team.name.label')}
            name={FieldName.NAME}
            error={errors[FieldName.NAME]}
          >
            <Input {...register(FieldName.NAME)} />
          </FormField>

          <FormField
            label={t('team.website.label')}
            name={FieldName.WEBSITE}
            error={errors[FieldName.WEBSITE]}
            optional
          >
            <Input {...register(FieldName.WEBSITE)} placeholder='https://' />
          </FormField>
        </FormRow>

        <FormField
          label={t('team.description.label')}
          name={FieldName.DESCRIPTION}
          error={errors[FieldName.DESCRIPTION]}
          optional
        >
          <Textarea {...register(FieldName.DESCRIPTION)} />
        </FormField>

        <FormRow forceColumns>
          <FormField label={t('createdAt')} optional>
            <FormReadOnly>{formatDate(team.createdAt)}</FormReadOnly>
          </FormField>
          <FormField label={t('updatedAt')} optional>
            <FormReadOnly>{formatDate(team.updatedAt)}</FormReadOnly>
          </FormField>
        </FormRow>

        <FormActions isDirty={isDirty}>
          <SubmitButton isLoading={isSubmitting}>{t('save')}</SubmitButton>
        </FormActions>
      </FormFields>
    </FormRoot>
  )
}
