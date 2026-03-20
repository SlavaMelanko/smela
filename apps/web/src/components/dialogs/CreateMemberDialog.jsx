import { InviteForm } from '@/components/form'
import { DialogBody, DialogHeader, DialogTitle } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'
import { useTeamMemberDefaultPermissions } from '@/hooks/useTeam'

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
