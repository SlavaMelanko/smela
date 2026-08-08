import { EmailSenderProfileForm } from '@ui/components/form'
import { useLocale } from '@ui/hooks/useLocale'
import { useUpdateEmailSenderProfile } from '@ui/hooks/useSystem'
import { useToast } from '@ui/hooks/useToast'

export const EmailSenderProfileSection = ({
  senderProfile,
  canManageSystem = false
}) => {
  const { t, te } = useLocale()
  const { showSuccessToast, showErrorToast } = useToast()
  const { mutate: updateEmailSenderProfile, isPending: isUpdating } =
    useUpdateEmailSenderProfile(senderProfile.profile)

  const handleUpdateEmailSenderProfile = data => {
    updateEmailSenderProfile(data, {
      onSuccess: () => {
        showSuccessToast(t('changesSaved'))
      },
      onError: error => {
        showErrorToast(te(error))
      }
    })
  }

  return (
    <EmailSenderProfileForm
      senderProfile={senderProfile}
      isSubmitting={isUpdating}
      onSubmit={handleUpdateEmailSenderProfile}
      canManageSystem={canManageSystem}
    />
  )
}
