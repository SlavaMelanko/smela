import { InviteForm } from '@ui/components/form'
import { DialogBody, DialogHeader, DialogTitle } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useTeamMemberDefaultPermissions } from '@ui/hooks/useTeam'

export const CreateMemberDialog = ({ onClose, onSubmit, teamId }) => {
  const { t } = useLocale()
  const { data: defaultPermissions, isPending: isPermissionsLoading } =
    useTeamMemberDefaultPermissions(teamId)

  return (
    <>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{t('invite.send.title.member')}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <InviteForm
          onSubmit={onSubmit}
          defaultPermissions={defaultPermissions}
          isPermissionsLoading={isPermissionsLoading}
        />
      </DialogBody>
    </>
  )
}
