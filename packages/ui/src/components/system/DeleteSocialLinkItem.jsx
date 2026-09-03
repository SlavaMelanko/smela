import {
  Button,
  Item,
  ItemActions,
  ItemContent,
  ItemTitle
} from '@ui/components/ui'
import { useDeleteSocialLink } from '@ui/hooks/useDeleteSocialLink'
import { useLocale } from '@ui/hooks/useLocale'

export const DeleteSocialLinkItem = ({ socialLink }) => {
  const { t } = useLocale()
  const { handleDeleteSocialLink, isDeleting } = useDeleteSocialLink(socialLink)

  return (
    <Item variant='outline' className='border-destructive/20'>
      <ItemContent>
        <ItemTitle className='text-base leading-normal font-normal'>
          {t('socialLink.delete.title')}
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <Button
          variant='destructive'
          disabled={isDeleting}
          onClick={handleDeleteSocialLink}
        >
          {t('socialLink.delete.cta')}
        </Button>
      </ItemActions>
    </Item>
  )
}
