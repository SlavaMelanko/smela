import { DeleteSocialLinkDialog } from '@ui/components/dialogs'
import { useLocale } from '@ui/hooks/useLocale'
import { useModal } from '@ui/hooks/useModal'
import { useNavigate } from '@ui/hooks/useRouter'
import { useRemoveSocialLink } from '@ui/hooks/useSystem'
import { useToast } from '@ui/hooks/useToast'

export const useDeleteSocialLink = socialLink => {
  const { t, te } = useLocale()
  const { openModal } = useModal()
  const navigate = useNavigate()
  const { showSuccessToast, showErrorToast } = useToast()
  const { mutate: deleteSocialLink, isPending: isDeleting } =
    useRemoveSocialLink(socialLink.id)

  const handleDeleteSocialLink = () => {
    const close = openModal({
      size: 'sm',
      children: (
        <DeleteSocialLinkDialog
          socialLink={socialLink}
          onClose={() => close()}
          onConfirm={() => {
            close()
            deleteSocialLink(undefined, {
              onSuccess: () => {
                showSuccessToast(t('socialLink.delete.success'))

                // The detail route is keyed by an id that no longer exists, and
                // replace drops the history entry holding the stale router state
                navigate('/system', { replace: true })
              },
              onError: error => {
                showErrorToast(te(error))
              }
            })
          }}
        />
      )
    })
  }

  return { handleDeleteSocialLink, isDeleting }
}
