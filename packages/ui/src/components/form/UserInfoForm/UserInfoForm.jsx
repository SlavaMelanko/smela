// React Compiler breaks RHF's proxy-based isDirty subscription
'use no memo'

import {
  FormActions,
  FormController,
  FormField,
  FormFields,
  FormReadOnly,
  FormRoot,
  FormRow,
  SubmitButton
} from '@ui/components/form'
import { removeHiddenFields } from '@ui/components/form/utils'
import { Input } from '@ui/components/ui'
import { StatusDropdown } from '@ui/components/UserStatus'
import { useLocale } from '@ui/hooks/useLocale'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  defaultFields,
  FieldName,
  getDefaultValues,
  getValues,
  resolver
} from './schema'

export const UserInfoForm = ({
  user,
  isSubmitting,
  onSubmit,
  formFields = {},
  readOnly = false
}) => {
  const fields = { ...defaultFields, ...formFields }
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

  useEffect(() => {
    if (user) {
      reset(getValues(user))
    }
  }, [user, reset])

  const submit = (data, event) =>
    onSubmit(removeHiddenFields(data, fields), event)

  return (
    <FormRoot onSubmit={handleSubmit(submit)}>
      <FormFields>
        <FormRow>
          <FormField
            label={t('firstName.label')}
            name={FieldName.FIRST_NAME}
            error={errors[FieldName.FIRST_NAME]}
          >
            <Input {...register(FieldName.FIRST_NAME)} readOnly={readOnly} />
          </FormField>

          <FormField
            label={t('lastName.label')}
            name={FieldName.LAST_NAME}
            error={errors[FieldName.LAST_NAME]}
            optional
          >
            <Input {...register(FieldName.LAST_NAME)} readOnly={readOnly} />
          </FormField>
        </FormRow>

        {fields[FieldName.STATUS] && (
          <FormRow>
            <FormController
              name={FieldName.STATUS}
              label={t('status.name')}
              control={control}
              render={({ field, id }) => (
                <StatusDropdown
                  id={id}
                  value={field.value}
                  onChange={field.onChange}
                  readOnly={readOnly}
                />
              )}
            />
          </FormRow>
        )}

        <FormRow forceColumns>
          <FormField label={t('createdAt')} optional>
            <FormReadOnly>{formatDate(user?.createdAt)}</FormReadOnly>
          </FormField>
          <FormField label={t('updatedAt')} optional>
            <FormReadOnly>{formatDate(user?.updatedAt)}</FormReadOnly>
          </FormField>
        </FormRow>

        {!readOnly && (
          <FormActions isDirty={isDirty}>
            <SubmitButton isLoading={isSubmitting}>{t('save')}</SubmitButton>
          </FormActions>
        )}
      </FormFields>
    </FormRoot>
  )
}
