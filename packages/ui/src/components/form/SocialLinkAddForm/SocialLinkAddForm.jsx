import {
  FormController,
  FormField,
  FormFields,
  FormRoot,
  SubmitButton
} from '@ui/components/form'
import { SvgEditor } from '@ui/components/svg'
import { Input } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useForm } from 'react-hook-form'

import { FieldName, getDefaultValues, resolver } from './schema'

export const SocialLinkAddForm = ({ isLoading, submitLabel, onSubmit }) => {
  const { t } = useLocale()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver,
    defaultValues: getDefaultValues()
  })

  return (
    <FormRoot onSubmit={handleSubmit(data => onSubmit(data))}>
      <FormFields>
        <FormField
          label={t('name.label')}
          name={FieldName.NAME}
          error={errors[FieldName.NAME]}
        >
          <Input {...register(FieldName.NAME)} />
        </FormField>

        <FormField
          label={t('url.label')}
          name={FieldName.URL}
          error={errors[FieldName.URL]}
        >
          <Input {...register(FieldName.URL)} placeholder='https://' />
        </FormField>

        <FormController
          name={FieldName.SVG}
          label={t('svg.label')}
          control={control}
          error={errors[FieldName.SVG]}
          render={({ field, id }) => <SvgEditor {...field} id={id} stacked />}
        />
      </FormFields>

      <SubmitButton isLoading={isSubmitting || isLoading}>
        {submitLabel}
      </SubmitButton>
    </FormRoot>
  )
}
