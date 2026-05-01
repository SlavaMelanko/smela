import {
  FormField,
  FormFields,
  FormGroup,
  FormRoot,
  PermissionsMatrix,
  SubmitButton
} from '@ui/components/form'
import { removeHiddenFields } from '@ui/components/form/utils'
import { Input } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { defaultFields, FieldName, getDefaultValues, resolver } from './schema'

export const InviteForm = ({
  isPermissionsLoading,
  onSubmit,
  defaultPermissions,
  formFields = {}
}) => {
  const { t } = useLocale()
  const fields = { ...defaultFields, ...formFields }

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver,
    defaultValues: getDefaultValues()
  })

  useEffect(() => {
    if (defaultPermissions) {
      reset(
        { [FieldName.PERMISSIONS]: defaultPermissions },
        { keepValues: true }
      )
    }
  }, [defaultPermissions, reset])

  const submit = data => onSubmit(removeHiddenFields(data, fields))

  return (
    <FormRoot onSubmit={handleSubmit(submit)}>
      <FormGroup legend={t('personalDetails')}>
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

          {fields[FieldName.POSITION] && (
            <FormField
              label={t('position.label')}
              name={FieldName.POSITION}
              error={errors[FieldName.POSITION]}
              optional
            >
              <Input {...register(FieldName.POSITION)} />
            </FormField>
          )}
        </FormFields>
      </FormGroup>

      {fields[FieldName.PERMISSIONS] && (
        <FormGroup legend={t('permissions.name')}>
          <PermissionsMatrix
            control={control}
            permissions={defaultPermissions}
            isLoading={isPermissionsLoading}
          />
        </FormGroup>
      )}

      <SubmitButton
        isLoading={isSubmitting}
        disabled={isPermissionsLoading && !defaultPermissions}
      >
        {t('invite.send.cta')}
      </SubmitButton>
    </FormRoot>
  )
}
