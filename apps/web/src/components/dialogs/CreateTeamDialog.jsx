import { TeamAddForm } from '@/components/form'
import { DialogBody, DialogHeader, DialogTitle } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'

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
