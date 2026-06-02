import { FieldName, InviteForm } from '@ui/components/form/InviteForm'
import { DialogBody, DialogHeader, DialogTitle } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useAdminDefaultPermissions } from '@ui/hooks/useOwner'

export const CreateAdminDialog = ({ onClose, onSubmit }) => {
  const { t } = useLocale()
  const { data: defaultPermissions, isPending: isPermissionsLoading } =
    useAdminDefaultPermissions()

  return (
    <>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{t('invite.send.title.admin')}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <InviteForm
          onSubmit={onSubmit}
          defaultPermissions={defaultPermissions}
          isPermissionsLoading={isPermissionsLoading}
          formFields={{ [FieldName.POSITION]: false }}
        />
      </DialogBody>
    </>
  )
}
