import { PermissionsSection } from '@ui/components/profile'
import {
  useAdminPermissions,
  useUpdateAdminPermissions
} from '@ui/hooks/useOwner'

export const PermissionsTab = ({ adminId }) => {
  const { data: permissions, isPending: isLoading } =
    useAdminPermissions(adminId)
  const { mutate: update, isPending: isUpdating } =
    useUpdateAdminPermissions(adminId)

  return (
    <PermissionsSection
      isLoading={isLoading}
      permissions={permissions}
      update={update}
      isUpdating={isUpdating}
    />
  )
}
