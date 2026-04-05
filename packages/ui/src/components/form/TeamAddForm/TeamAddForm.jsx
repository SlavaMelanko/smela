import {
  FormField,
  FormFields,
  FormRoot,
  SubmitButton
} from '@ui/components/form'
import { Input, Textarea } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useForm } from 'react-hook-form'

import { FieldName, getDefaultValues, resolver } from './schema'

export const TeamAddForm = ({ isLoading, submitLabel, onSubmit }) => {
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

        <FormField
          label={t('team.description.label')}
          name={FieldName.DESCRIPTION}
          error={errors[FieldName.DESCRIPTION]}
          optional
        >
          <Textarea {...register(FieldName.DESCRIPTION)} />
        </FormField>
      </FormFields>

      <SubmitButton isLoading={isSubmitting || isLoading}>
        {submitLabel}
      </SubmitButton>
    </FormRoot>
  )
}
