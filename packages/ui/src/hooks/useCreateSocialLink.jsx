import { CreateSocialLinkDialog } from '@ui/components/dialogs'
import { useLocale } from '@ui/hooks/useLocale'
import { useModal } from '@ui/hooks/useModal'
import { useCreateSocialLink as useCreateSocialLinkMutation } from '@ui/hooks/useSystem'
import { useToast } from '@ui/hooks/useToast'

export const useCreateSocialLink = () => {
  const { t, te } = useLocale()
  const { openModal } = useModal()
  const { showSuccessToast, showErrorToast } = useToast()
  const { mutate: createSocialLink } = useCreateSocialLinkMutation()

  const openCreateSocialLinkDialog = () => {
    const close = openModal({
      children: (
        <CreateSocialLinkDialog
          onClose={() => close()}
          onSubmit={data => {
            close()

            createSocialLink(data, {
              onSuccess: () => {
                showSuccessToast(t('socialLink.add.success'))
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

  return { openCreateSocialLinkDialog }
}
