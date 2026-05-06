import {
  FormActions,
  FormRoot,
  PermissionsMatrix,
  SubmitButton
} from '@ui/components/form'
import { useLocale } from '@ui/hooks/useLocale'
import { useToast } from '@ui/hooks/useToast'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

export const PermissionsSection = ({
  isLoading,
  permissions,
  update,
  isUpdating,
  canManageAdmins = true
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
      {canManageAdmins && (
        <FormActions isDirty={isDirty}>
          <SubmitButton isLoading={isUpdating}>{t('save')}</SubmitButton>
        </FormActions>
      )}
    </FormRoot>
  )
}
