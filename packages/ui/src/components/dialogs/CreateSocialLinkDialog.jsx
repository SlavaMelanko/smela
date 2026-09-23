import { SocialLinkAddForm } from '@ui/components/form'
import { DialogBody, DialogHeader, DialogTitle } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'

export const CreateSocialLinkDialog = ({ onClose, onSubmit }) => {
  const { t } = useLocale()

  return (
    <>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{t('socialLink.add.title')}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <SocialLinkAddForm
          submitLabel={t('socialLink.add.cta')}
          onSubmit={onSubmit}
        />
      </DialogBody>
    </>
  )
}
