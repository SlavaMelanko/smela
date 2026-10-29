import { DangerItem } from '@ui/components/DangerItem'
import { useDeleteSocialLink } from '@ui/hooks/useDeleteSocialLink'
import { useLocale } from '@ui/hooks/useLocale'

export const DeleteSocialLinkItem = ({ socialLink }) => {
  const { t } = useLocale()
  const { handleDeleteSocialLink, isDeleting } = useDeleteSocialLink(socialLink)

  return (
    <DangerItem
      title={t('socialLink.delete.title')}
      cta={t('socialLink.delete.cta')}
      disabled={isDeleting}
      onClick={handleDeleteSocialLink}
    />
  )
}
