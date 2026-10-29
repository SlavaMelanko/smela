import {
  Button,
  DialogBody,
  DialogControls,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'

export const LeaveTeamDialog = ({ onClose, onConfirm }) => {
  const { t } = useLocale()

  return (
    <>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{t('team.leave.title')}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <DialogDescription>{t('team.leave.description')}</DialogDescription>
        <DialogControls>
          <Button variant='outline' onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant='destructive' onClick={onConfirm}>
            {t('team.leave.cta')}
          </Button>
        </DialogControls>
      </DialogBody>
    </>
  )
}
