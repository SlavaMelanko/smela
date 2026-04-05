import { TeamAddForm } from '@ui/components/form'
import { DialogBody, DialogHeader, DialogTitle } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'

export const CreateTeamDialog = ({ onClose, onSubmit }) => {
  const { t } = useLocale()

  return (
    <>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{t('team.add.title')}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <TeamAddForm submitLabel={t('team.add.cta')} onSubmit={onSubmit} />
      </DialogBody>
    </>
  )
}
