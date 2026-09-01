import { SocialLinkForm } from '@ui/components/form'
import { useLocale } from '@ui/hooks/useLocale'
import { useUpdateSocialLink } from '@ui/hooks/useSystem'
import { useToast } from '@ui/hooks/useToast'

export const SocialLinkSection = ({ socialLink, canManageSystem = false }) => {
  const { t, te } = useLocale()
  const { showSuccessToast, showErrorToast } = useToast()
  const { mutate: updateSocialLink, isPending: isUpdating } =
    useUpdateSocialLink(socialLink.network)

  const handleUpdateSocialLink = data => {
    updateSocialLink(data, {
      onSuccess: () => {
        showSuccessToast(t('changesSaved'))
      },
      onError: error => {
        showErrorToast(te(error))
      }
    })
  }

  return (
    <SocialLinkForm
      socialLink={socialLink}
      isSubmitting={isUpdating}
      onSubmit={handleUpdateSocialLink}
      canManageSystem={canManageSystem}
    />
  )
}
