import { InviteForm } from '@ui/components/form'
import { DialogBody, DialogHeader, DialogTitle } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useTeamMemberDefaultPermissions } from '@ui/hooks/useTeam'
import { grantFullAccess } from '@ui/lib/permissions'

export const CreateMemberDialog = ({
  onClose,
  onSubmit,
  teamId,
  isFirstMember = false
}) => {
  const { t } = useLocale()
  const { data: defaultPermissions, isPending: isPermissionsLoading } =
    useTeamMemberDefaultPermissions(teamId)

  const permissions =
    isFirstMember && defaultPermissions
      ? grantFullAccess(defaultPermissions)
      : defaultPermissions

  return (
    <>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{t('invite.send.title.member')}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <InviteForm
          onSubmit={onSubmit}
          defaultPermissions={permissions}
          isPermissionsLoading={isPermissionsLoading}
        />
      </DialogBody>
    </>
  )
}
