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
import { SvgEditor } from '@ui/components/svg'
import { Input } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { FieldName, getDefaultValues, getValues, resolver } from './schema'

export const SocialLinkForm = ({
  socialLink,
  isSubmitting,
  onSubmit,
  canManageSystem = false
}) => {
  const { t, formatDate } = useLocale()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty }
  } = useForm({
    resolver,
    defaultValues: getDefaultValues()
  })

  const svg = useWatch({ control, name: FieldName.SVG })

  useEffect(() => {
    if (socialLink) {
      reset(getValues(socialLink))
    }
  }, [socialLink, reset])

  return (
    <FormRoot onSubmit={handleSubmit(onSubmit)}>
      <FormFields>
        <FormRow>
          <FormField
            label={t('socialLink.network.label')}
            name={FieldName.NETWORK}
            error={errors[FieldName.NETWORK]}
          >
            <Input
              {...register(FieldName.NETWORK)}
              readOnly={!canManageSystem}
            />
          </FormField>

          <FormField
            label={t('socialLink.url.label')}
            name={FieldName.URL}
            error={errors[FieldName.URL]}
          >
            <Input {...register(FieldName.URL)} readOnly={!canManageSystem} />
          </FormField>
        </FormRow>

        <FormField
          label={t('socialLink.svg.label')}
          name={FieldName.SVG}
          error={errors[FieldName.SVG]}
        >
          <SvgEditor
            {...register(FieldName.SVG)}
            value={svg}
            readOnly={!canManageSystem}
          />
        </FormField>

        <FormRow forceColumns>
          <FormField label={t('createdAt')} optional>
            <FormReadOnly>{formatDate(socialLink.createdAt)}</FormReadOnly>
          </FormField>
          <FormField label={t('updatedAt')} optional>
            <FormReadOnly>{formatDate(socialLink.updatedAt)}</FormReadOnly>
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
