import { UserInfoForm } from '@/components/form'
import { useLocale } from '@/hooks/useLocale'
import { useToast } from '@/hooks/useToast'

export const ProfileSection = ({ user, update, isUpdating, fieldsConfig }) => {
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
      fieldsConfig={fieldsConfig}
    />
  )
}
