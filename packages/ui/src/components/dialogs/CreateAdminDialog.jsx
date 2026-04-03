import { FieldName, InviteForm } from '@/components/form/InviteForm'
import { DialogBody, DialogHeader, DialogTitle } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'
import { useAdminDefaultPermissions } from '@/hooks/useOwner'

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
          fieldsConfig={{ [FieldName.POSITION]: false }}
        />
      </DialogBody>
    </>
  )
}
