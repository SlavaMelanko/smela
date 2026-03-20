import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  FormActions,
  FormRoot,
  PermissionsMatrix,
  SubmitButton
} from '@/components/form'
import { useLocale } from '@/hooks/useLocale'
import { useToast } from '@/hooks/useToast'

export const PermissionsSection = ({
  isLoading,
  permissions,
  update,
  isUpdating
}) => {
  const { t, te } = useLocale()
  const { showSuccessToast, showErrorToast } = useToast()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty }
  } = useForm()

  useEffect(() => {
    if (permissions) {
      reset({ permissions })
    }
  }, [permissions, reset])

  const handleUpdate = data => {
    update(data, {
      onSuccess: () => {
        showSuccessToast(t('changesSaved'))
      },
      onError: error => {
        showErrorToast(te(error))
      }
    })
  }

  return (
    <FormRoot onSubmit={handleSubmit(handleUpdate)}>
      <PermissionsMatrix
        control={control}
        permissions={permissions}
        isLoading={isLoading}
      />
      <FormActions isDirty={isDirty}>
        <SubmitButton isLoading={isUpdating}>{t('save')}</SubmitButton>
      </FormActions>
    </FormRoot>
  )
}
