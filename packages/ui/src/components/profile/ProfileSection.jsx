import { UserInfoForm } from '@ui/components/form'
import { useLocale } from '@ui/hooks/useLocale'
import { useToast } from '@ui/hooks/useToast'

export const ProfileSection = ({ user, update, isUpdating, formFields }) => {
  const { t, te } = useLocale()
  const { showSuccessToast, showErrorToast } = useToast()

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
    <UserInfoForm
      user={user}
      isSubmitting={isUpdating}
      onSubmit={handleUpdate}
      formFields={formFields}
    />
  )
}
