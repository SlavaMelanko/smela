import {
  Button,
  DialogBody,
  DialogControls,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'

export const DeleteSocialLinkDialog = ({ onClose, onConfirm, socialLink }) => {
  const { t } = useLocale()

  return (
    <>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{t('socialLink.delete.title')}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <DialogDescription>
          {t('socialLink.delete.description', { name: socialLink.name })}
        </DialogDescription>
        <DialogControls>
          <Button variant='outline' onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant='destructive' onClick={onConfirm}>
            {t('socialLink.delete.cta')}
          </Button>
        </DialogControls>
      </DialogBody>
    </>
  )
}
