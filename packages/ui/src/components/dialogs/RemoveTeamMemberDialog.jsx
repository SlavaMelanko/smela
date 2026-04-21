import {
  Button,
  DialogBody,
  DialogControls,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { getFullName } from '@ui/lib/format'

export const RemoveTeamMemberDialog = ({ onClose, onConfirm, member }) => {
  const { t } = useLocale()

  return (
    <>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{t('team.members.remove.title')}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <DialogDescription>
          {t('team.members.remove.description', { name: getFullName(member) })}
        </DialogDescription>
        <DialogControls>
          <Button variant='outline' onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant='destructive' onClick={onConfirm}>
            {t('team.members.remove.cta')}
          </Button>
        </DialogControls>
      </DialogBody>
    </>
  )
}
